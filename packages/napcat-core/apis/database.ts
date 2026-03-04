import path from 'node:path';
import { InstanceContext, NapCatCore } from '@/napcat-core/index';
import {
  checkSqliteAvailable,
  readSingleDatabase,
  scanAllDatabases,
  formatScanResults,
  decryptDatabaseFile,
  type DatabaseScanResult,
  type DatabaseReadOptions,
  type TableInfo,
} from 'napcat-database';

export class NTQQDatabaseApi {
  context: InstanceContext;
  core: NapCatCore;

  constructor (context: InstanceContext, core: NapCatCore) {
    this.context = context;
    this.core = core;
  }

  /** node:sqlite 是否可用 */
  async isSqliteAvailable (): Promise<boolean> {
    return checkSqliteAvailable();
  }

  /** 获取当前账号的 nt_db 目录 */
  getNtDbDir (): string {
    return path.resolve(this.core.dataPath, this.core.selfInfo.uin, 'nt_qq', 'nt_db');
  }

  /**
   * 获取解密缓存目录
   * 默认: <NapCatDataPath>/db_<uin>/
   * 可通过 customDir 完全自定义
   */
  getDefaultCacheDir (customDir?: string): string {
    if (customDir) return customDir;
    return path.resolve(this.core.NapCatDataPath, `db_${this.core.selfInfo.uin}`);
  }

  /** 当前是否已获取到数据库 passphrase */
  hasPassphrase (): boolean {
    return !!this.core.dbPassphrase;
  }

  /** 获取 passphrase Buffer，未获取时返回 null */
  getPassphraseBuffer (): Buffer | null {
    return this.core.dbPassphrase ? Buffer.from(this.core.dbPassphrase) : null;
  }

  /**
   * 读取单个加密数据库
   * @param dbName    数据库文件名 (如 'nt_msg.db')，或完整路径
   * @param cacheDir  自定义缓存目录，默认 db_<uin>
   * @param options   其他选项
   */
  readDatabase (dbName: string, cacheDir?: string, options?: Omit<DatabaseReadOptions, 'cacheDir'>): DatabaseScanResult | null {
    const passphrase = this.getPassphraseBuffer();
    if (!passphrase) return null;

    // 判断是文件名还是完整路径
    const dbPath = path.isAbsolute(dbName) ? dbName : path.resolve(this.getNtDbDir(), dbName);
    const resolvedCacheDir = this.getDefaultCacheDir(cacheDir);

    return readSingleDatabase(dbPath, passphrase, { cacheDir: resolvedCacheDir, ...options });
  }

  /**
   * 扫描所有加密数据库
   * @param cacheDir  自定义缓存目录，默认 db_<uin>
   * @param options   其他选项
   */
  scanDatabases (cacheDir?: string, options?: Omit<DatabaseReadOptions, 'cacheDir'>): DatabaseScanResult[] {
    const passphrase = this.getPassphraseBuffer();
    if (!passphrase) return [];

    const resolvedCacheDir = this.getDefaultCacheDir(cacheDir);
    return scanAllDatabases(this.getNtDbDir(), passphrase, { cacheDir: resolvedCacheDir, ...options });
  }

  /**
   * 仅解密数据库文件（不读取表信息，不需要 node:sqlite）
   * @param dbName    数据库文件名或完整路径
   * @param outputPath  输出路径，默认保存到 db_<uin>/<dbName>
   */
  decryptDatabase (dbName: string, outputPath?: string): string | null {
    const passphrase = this.getPassphraseBuffer();
    if (!passphrase) return null;

    const dbPath = path.isAbsolute(dbName) ? dbName : path.resolve(this.getNtDbDir(), dbName);
    const outPath = outputPath ?? path.resolve(this.getDefaultCacheDir(), path.basename(dbName));

    return decryptDatabaseFile(dbPath, passphrase, outPath);
  }

  /** 格式化扫描结果为可读字符串 */
  formatResults (results: DatabaseScanResult[]): string {
    return formatScanResults(results);
  }
}

export type { DatabaseScanResult, DatabaseReadOptions, TableInfo };
