import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { decryptDatabase, decryptDatabaseFile, isEncryptedNTDB } from './decrypt';

type DatabaseSyncType = import('node:sqlite').DatabaseSync;
type DatabaseSyncCtor = new (path: string, options?: { readOnly?: boolean; }) => DatabaseSyncType;
type SQLInputValue = import('node:sqlite').SQLInputValue;

let _DatabaseSync: DatabaseSyncCtor | null = null;
let _sqliteChecked = false;

async function loadSqlite (): Promise<DatabaseSyncCtor | null> {
  if (_sqliteChecked) return _DatabaseSync;
  _sqliteChecked = true;
  try {
    const mod = await import('node:sqlite');
    _DatabaseSync = mod.DatabaseSync as unknown as DatabaseSyncCtor;
    return _DatabaseSync;
  } catch {
    _DatabaseSync = null;
    return null;
  }
}

function getDatabaseSync (): DatabaseSyncCtor {
  if (!_DatabaseSync) {
    throw new Error(
      'node:sqlite 不可用。请使用 Node.js 22+ 并添加 --experimental-sqlite 标志，' +
      '或调用 checkSqliteAvailable() 检查可用性。'
    );
  }
  return _DatabaseSync;
}

export async function checkSqliteAvailable (): Promise<boolean> {
  const ctor = await loadSqlite();
  return ctor !== null;
}

// ======================== 数据库连接管理 ========================

/** 数据库连接句柄，封装 DatabaseSync 实例 */
export class DatabaseHandle {
  private db: DatabaseSyncType;
  private _closed = false;
  readonly filePath: string;
  readonly readOnly: boolean;

  constructor (filePath: string, readOnly = false) {
    const DB = getDatabaseSync();
    this.db = new DB(filePath, { readOnly });
    this.filePath = filePath;
    this.readOnly = readOnly;
  }

  /** 数据库是否已关闭 */
  get closed (): boolean {
    return this._closed;
  }

  private ensureOpen (): void {
    if (this._closed) throw new Error('数据库已关闭');
  }

  /**
   * 执行 SELECT 查询，返回所有结果行
   * @param sql    SQL 语句
   * @param params 绑定参数 (位置参数数组 或 命名参数对象)
   */
  query<T = Record<string, unknown>> (sql: string, params?: SQLInputValue[] | Record<string, SQLInputValue>): T[] {
    this.ensureOpen();
    const stmt = this.db.prepare(sql);
    if (params) {
      if (Array.isArray(params)) {
        return stmt.all(...params) as T[];
      }
      return stmt.all(params) as T[];
    }
    return stmt.all() as T[];
  }

  /**
   * 执行 SELECT 查询，仅返回第一行
   * @param sql    SQL 语句
   * @param params 绑定参数
   */
  queryOne<T = Record<string, unknown>> (sql: string, params?: SQLInputValue[] | Record<string, SQLInputValue>): T | undefined {
    this.ensureOpen();
    const stmt = this.db.prepare(sql);
    if (params) {
      if (Array.isArray(params)) {
        return stmt.get(...params) as T | undefined;
      }
      return stmt.get(params) as T | undefined;
    }
    return stmt.get() as T | undefined;
  }

  /**
   * 执行非查询 SQL (INSERT/UPDATE/DELETE/CREATE 等)
   * @param sql    SQL 语句
   * @param params 绑定参数
   * @returns      受影响的行数信息
   */
  execute (sql: string, params?: SQLInputValue[] | Record<string, SQLInputValue>): { changes: number | bigint; lastInsertRowid: number | bigint; } {
    this.ensureOpen();
    const stmt = this.db.prepare(sql);
    if (params) {
      if (Array.isArray(params)) {
        return stmt.run(...params);
      }
      return stmt.run(params);
    }
    return stmt.run();
  }

  /** 列出所有表的信息 */
  listTables (): TableInfo[] {
    this.ensureOpen();
    return extractTablesInfo(this.db);
  }

  /** 获取指定表的列信息 */
  getTableColumns (tableName: string): ColumnInfo[] {
    this.ensureOpen();
    const cols = this.db.prepare(`PRAGMA table_info([${tableName}])`).all() as {
      cid: number; name: string; type: string; notnull: number; pk: number;
    }[];
    return cols.map(col => ({
      cid: col.cid,
      name: col.name,
      type: col.type,
      notnull: col.notnull === 1,
      pk: col.pk === 1,
    }));
  }

  /** 获取表的行数 */
  getRowCount (tableName: string): number {
    this.ensureOpen();
    const cnt = this.db.prepare(`SELECT count(*) as cnt FROM [${tableName}]`).get() as { cnt: number; } | undefined;
    return cnt?.cnt ?? 0;
  }

  /** 关闭数据库连接 */
  close (): void {
    if (!this._closed) {
      this.db.close();
      this._closed = true;
    }
  }
}

/**
 * 打开一个已解密的 SQLite 数据库文件
 * @param filePath  解密后的 .db 文件路径
 * @param readOnly  是否以只读模式打开 (默认 true)
 */
export function openDatabase (filePath: string, readOnly = true): DatabaseHandle {
  return new DatabaseHandle(filePath, readOnly);
}

/**
 * 解密并打开一个加密的 NTQQ 数据库
 * @param dbPath     加密数据库路径
 * @param passphrase 密钥口令
 * @param cacheDir   解密缓存目录 (可选)
 * @param readOnly   是否只读 (默认 true)
 */
export function decryptAndOpen (
  dbPath: string,
  passphrase: Buffer,
  cacheDir?: string,
  readOnly = true
): DatabaseHandle {
  const filename = path.basename(dbPath);

  if (cacheDir) {
    const cachedPath = path.join(cacheDir, filename);
    // 已存在缓存直接打开
    if (fs.existsSync(cachedPath)) {
      return new DatabaseHandle(cachedPath, readOnly);
    }
    fs.mkdirSync(cacheDir, { recursive: true });
    const outPath = decryptDatabaseFile(dbPath, passphrase, cachedPath);
    if (!outPath) throw new Error(`解密失败: ${dbPath}`);
    return new DatabaseHandle(outPath, readOnly);
  }

  // 无缓存目录: 解密到临时文件
  const tmpPath = path.join(os.tmpdir(), `napcat_db_${Date.now()}_${Math.random().toString(36).slice(2)}.db`);
  const fileData = fs.readFileSync(dbPath);
  const decryptedBuf = decryptDatabase(fileData, passphrase);
  if (!decryptedBuf) throw new Error(`解密失败: ${dbPath}`);
  fs.writeFileSync(tmpPath, decryptedBuf);
  return new DatabaseHandle(tmpPath, readOnly);
}

/** 单个数据库表信息 */
export interface TableInfo {
  name: string;
  type: string;     // 'table' | 'view' | ...
  rowCount: number;
  columns: ColumnInfo[];
}

/** 列信息 */
export interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: boolean;
  pk: boolean;
}

/** 单个数据库扫描结果 */
export interface DatabaseScanResult {
  /** 数据库文件名 */
  filename: string;
  /** 原始加密文件路径 */
  sourcePath: string;
  /** 解密后缓存文件路径 (仅当指定了 cacheDir 时) */
  cachePath?: string;
  success: boolean;
  error?: string;
  tables: TableInfo[];
}

/** 扫描/读取选项 */
export interface DatabaseReadOptions {
  /** 解密后数据库缓存目录，不设置则使用临时文件 */
  cacheDir?: string;
  /** 是否跳过已存在的缓存文件 (默认 true) */
  skipExistingCache?: boolean;
}

/**
 * 从 DatabaseSync 对象提取表信息
 */
function extractTablesInfo (db: DatabaseSyncType): TableInfo[] {
  const tables: TableInfo[] = [];

  const masterRows = db.prepare(
    "SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') ORDER BY name"
  ).all() as { name: string; type: string; }[];

  for (const { name: tableName, type: tableType } of masterRows) {
    // 获取列信息
    const columns: ColumnInfo[] = [];
    try {
      const cols = db.prepare(`PRAGMA table_info([${tableName}])`).all() as {
        cid: number; name: string; type: string; notnull: number; pk: number;
      }[];
      for (const col of cols) {
        columns.push({
          cid: col.cid,
          name: col.name,
          type: col.type,
          notnull: col.notnull === 1,
          pk: col.pk === 1,
        });
      }
    } catch {
      // PRAGMA 可能对某些表失败
    }

    // 获取行数
    let rowCount = 0;
    try {
      const cnt = db.prepare(`SELECT count(*) as cnt FROM [${tableName}]`).get() as { cnt: number; } | undefined;
      rowCount = cnt?.cnt ?? 0;
    } catch {
      rowCount = -1;
    }

    tables.push({
      name: tableName,
      type: tableType,
      rowCount,
      columns,
    });
  }

  return tables;
}

/**
 * 打开一个解密后的 SQLite 文件，列出所有表和列信息
 */
export function listTablesFromFile (filePath: string): TableInfo[] {
  const DB = getDatabaseSync();
  const db = new DB(filePath, { readOnly: true });
  try {
    return extractTablesInfo(db);
  } finally {
    db.close();
  }
}

export function listTablesFromBuffer (data: Buffer): TableInfo[] {
  const tmpPath = path.join(os.tmpdir(), `napcat_db_${Date.now()}_${Math.random().toString(36).slice(2)}.db`);
  try {
    fs.writeFileSync(tmpPath, data);
    return listTablesFromFile(tmpPath);
  } finally {
    try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }
  }
}

/**
 * 解密并读取单个数据库文件
 *
 * @param dbPath      加密数据库文件路径
 * @param passphrase  密钥口令
 * @param options     可选配置 (缓存目录等)
 * @returns           数据库扫描结果
 */
export function readSingleDatabase (
  dbPath: string,
  passphrase: Buffer,
  options?: DatabaseReadOptions
): DatabaseScanResult {
  const filename = path.basename(dbPath);
  const result: DatabaseScanResult = {
    filename,
    sourcePath: dbPath,
    success: false,
    tables: [],
  };

  try {
    // 如果指定了缓存目录，且缓存文件已存在，直接读取
    if (options?.cacheDir) {
      const cachedPath = path.join(options.cacheDir, filename);
      result.cachePath = cachedPath;

      if (options?.skipExistingCache !== false && fs.existsSync(cachedPath)) {
        result.tables = listTablesFromFile(cachedPath);
        result.success = true;
        return result;
      }
    }

    const fileData = fs.readFileSync(dbPath);
    if (!isEncryptedNTDB(fileData)) {
      result.error = 'Not an encrypted NTQQ database';
      return result;
    }

    // 有缓存目录: 解密写入文件再读取
    if (options?.cacheDir) {
      fs.mkdirSync(options.cacheDir, { recursive: true });
      const outPath = decryptDatabaseFile(dbPath, passphrase, result.cachePath);
      if (!outPath) {
        result.error = 'Decryption failed';
        return result;
      }
      result.cachePath = outPath;
      result.tables = listTablesFromFile(outPath);
    } else {
      // 无缓存目录: 解密到内存再用临时文件读取
      const decryptedBuf = decryptDatabase(fileData, passphrase);
      if (!decryptedBuf) {
        result.error = 'Decryption returned null';
        return result;
      }
      result.tables = listTablesFromBuffer(decryptedBuf);
    }

    result.success = true;
  } catch (e) {
    result.error = e instanceof Error ? e.message : String(e);
  }

  return result;
}

export function scanAllDatabases (
  dbDir: string,
  passphrase: Buffer,
  options?: DatabaseReadOptions
): DatabaseScanResult[] {
  const results: DatabaseScanResult[] = [];

  if (!fs.existsSync(dbDir)) return results;

  const files = fs.readdirSync(dbDir).filter(f => f.endsWith('.db')).sort();

  for (const filename of files) {
    const filePath = path.join(dbDir, filename);
    const result = readSingleDatabase(filePath, passphrase, options);
    results.push(result);
  }

  return results;
}

/**
 * 格式化扫描结果为可读字符串
 */
export function formatScanResults (results: DatabaseScanResult[]): string {
  const lines: string[] = [];
  let totalTables = 0;
  let successCount = 0;

  for (const db of results) {
    if (db.success) {
      successCount++;
      const cacheNote = db.cachePath ? ` → ${db.cachePath}` : '';
      lines.push(`=== ${db.filename} (${db.tables.length} tables)${cacheNote} ===`);
      for (const table of db.tables) {
        totalTables++;
        const colList = table.columns.map(c => `${c.name}:${c.type || '?'}`).join(', ');
        lines.push(`  ${table.name}: ${table.rowCount} rows [${colList}]`);
      }
    } else {
      lines.push(`=== ${db.filename}: SKIP (${db.error}) ===`);
    }
    lines.push('');
  }

  lines.push(`Summary: ${successCount}/${results.length} databases decrypted, ${totalTables} total tables`);
  return lines.join('\n');
}
