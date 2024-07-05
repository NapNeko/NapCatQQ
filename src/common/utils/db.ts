import { ElementType, FileElement, PicElement, PttElement, RawMessage, VideoElement } from '../../core/src/entities';

import sqlite3 from 'sqlite3';
import { log, logDebug, logError } from '@/common/utils/log';
import { NTQQMsgApi } from '@/core';
import LRU from '@/common/utils/LRUCache';

export interface IRember {
  last_sent_time: number;
  join_time: number;
  user_id: number;
}


type DBMsg = {
  id: number,
  shortId: number,
  longId: string,
  seq: number,
  peerUid: string,
  chatType: number,
}

type DBFile = {
  name: string;  // 文件名
  path: string;
  url: string;
  size: number;
  uuid: string;
  msgId: string;
  elementId: string;
  element: PicElement | VideoElement | FileElement | PttElement;
  elementType: ElementType.PIC | ElementType.VIDEO | ElementType.FILE | ElementType.PTT;
}


class DBUtilBase {
  protected db: sqlite3.Database | undefined;

  async init(dbPath: string) {
    if (this.db) {
      return;
    }
    return new Promise<void>((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
          logError('Could not connect to database', err);
          reject(err);
          return;
        }
        this.createTable();
        resolve();
      });
    });
  }

  protected createTable() {
    throw new Error('Method not implemented.');
  }

  close() {
    this.db?.close();
  }
}

class DBUtil extends DBUtilBase {
  private msgCache: Map<string | number, RawMessage> = new Map<string | number, RawMessage>();
  private globalMsgShortId = -2147483640;
  private groupIds: number[] = [];
  private LURCache = new LRU<number>();
  private LastSentCache = new (class {
    private cache: { gid: number; uid: number }[] = [];
    private maxSize: number;

    constructor(maxSize: number = 5000) {
      this.maxSize = maxSize;
    }

    get(gid: number, uid: number): boolean {
      const exists = this.cache.some(
        (entry) => entry.gid === gid && entry.uid === uid
      );
      if (!exists) {
        this.cache.push({ gid, uid });
        if (this.cache.length > this.maxSize) {
          this.cache.shift();
        }
      }

      return exists;
    }
  })();

  constructor() {
    super();
    const interval = 1000 * 60 * 10;  // 10分钟清理一次缓存
    setInterval(() => {
      logDebug('清理消息缓存');
      this.msgCache.forEach((msg, key) => {
        if ((Date.now() - parseInt(msg.msgTime) * 1000) > interval) {
          this.msgCache.delete(key);
        }
      });
    }, interval);
  }

  async init(dbPath: string) {
    await super.init(dbPath);
    this.globalMsgShortId = await this.getCurrentMaxShortId();


    // 初始化群缓存列表
    this.db!.serialize(() => {
      const sql = 'SELECT * FROM sqlite_master WHERE type=\'table\'';
      this.db!.all(sql, [], (err, rows: { name: string }[]) => {
        if (err) return logError(err);
        rows.forEach((row) => this.groupIds.push(parseInt(row.name)));
        //logDebug(`已加载 ${groupIds.length} 个群`);
      });
    });


    this.LURCache.on(async (node) => {
      const { value: time, groupId, userId } = node;

      logDebug('插入发言时间', userId, groupId);
      await this.createGroupInfoTimeTableIfNotExist(groupId);

      const method = await this.getDataSetMethod(groupId, userId);
      logDebug('插入发言时间方法判断', userId, groupId, method);

      const sql =
        method == 'update'
          ? `UPDATE "${groupId}" SET last_sent_time = ? WHERE user_id = ?`
          : `INSERT INTO "${groupId}" (last_sent_time, user_id)  VALUES (?, ?)`;

      this.db!.all(sql, [time, userId], (err) => {
        if (err) {
          return logError('插入/更新发言时间失败', userId, groupId);
        }
        logDebug('插入/更新发言时间成功', userId, groupId);
      });

    });
  }
  async getDataSetMethod(groupId: number, userId: number) {
    // 缓存记录
    if (this.LastSentCache.get(groupId, userId)) {
      logDebug('缓存命中', userId, groupId);
      return 'update';
    }

    // 数据库判断
    return new Promise<'insert' | 'update'>((resolve, reject) => {
      this.db!.all(
        `SELECT * FROM "${groupId}" WHERE user_id = ?`,
        [userId],
        (err, rows) => {
          if (err) {
            logError('查询发言时间存在失败', userId, groupId, err);
            return logError('插入发言时间失败', userId, groupId, err);
          }

          if (rows.length === 0) {
            logDebug('查询发言时间不存在', userId, groupId);
            return resolve('insert');
          }

          logDebug('查询发言时间存在', userId, groupId);
          resolve('update');
        }
      );
    });
  }
  async createGroupInfoTimeTableIfNotExist(groupId: number) {
    const createTableSQL = (groupId: number) =>
      `CREATE TABLE IF NOT EXISTS "${groupId}" (
            user_id INTEGER,
            last_sent_time INTEGER,
            join_time INTEGER,
            PRIMARY KEY (user_id)
        );`;

    if (this.groupIds.includes(groupId)) {
      return;
    }
    return new Promise((resolve, reject) => {
      const sql = createTableSQL(groupId);
      this.db!.all(sql, (err) => {
        if (err) {
          reject(err);
          return;
        }
        this.groupIds.push(groupId);
        resolve(true);
      });
    });
  }
  protected createTable() {
    // 消息记录
    const createTableSQL = `
            CREATE TABLE IF NOT EXISTS msgs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                shortId INTEGER NOT NULL UNIQUE,
                longId TEXT NOT NULL UNIQUE,
                seq INTEGER NOT NULL,
                peerUid TEXT NOT NULL,
                chatType INTEGER NOT NULL
            )`;
    this.db!.run(createTableSQL, function (err) {
      if (err) {
        logError('Could not create table msgs', err.stack);
      }
    });

    // 文件缓存
    const createFileTableSQL = `
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                path TEXT NOT NULL,
                url TEXT,
                size INTEGER NOT NULL,
                uuid TEXT,
                elementType INTEGER,
                element TEXT NOT NULL,
                elementId TEXT NOT NULL,
                msgId TEXT NOT NULL
            )`;
    this.db!.run(createFileTableSQL, function (err) {
      if (err) {
        logError('Could not create table files', err);
      }
    });
  }

  private async getCurrentMaxShortId() {
    return new Promise<number>((resolve, reject) => {
      this.db!.get('SELECT MAX(shortId) as maxId FROM msgs', (err, row: { maxId: number }) => {
        if (err) {
          logDebug('Could not get max short id, Use default -2147483640', err);
          return resolve(-2147483640);
        }
        logDebug('数据库中消息最大短id', row?.maxId);
        resolve(row?.maxId ?? -2147483640);
      });
    });
  }

  private async getMsg(query: string, params: any[]) {
    const stmt = this.db!.prepare(query);
    return new Promise<RawMessage | null>((resolve, reject) => {
      stmt.get(...params, (err: any, row: DBMsg) => {
        // log("getMsg", row, err);
        if (err) {
          logError('Could not get msg', err, query, params);
          return resolve(null);
        }
        if (!row) {
          // logDebug('不存在数据库中的消息，不进行处理', query, params);
          resolve(null);
          return;
        }
        const msgId = row.longId;
        NTQQMsgApi.getMsgsByMsgId({ peerUid: row.peerUid, chatType: row.chatType }, [msgId]).then(res => {
          const msg = res.msgList[0];
          if (!msg) {
            resolve(null);
            return;
          }
          msg.id = row.shortId;
          resolve(msg);
        }).catch(e => {
          resolve(null);
        });
      });
    });
  }

  async getMsgByShortId(shortId: number): Promise<RawMessage | null> {
    if (this.msgCache.has(shortId)) {
      return this.msgCache.get(shortId)!;
    }
    const getStmt = 'SELECT * FROM msgs WHERE shortId = ?';
    return this.getMsg(getStmt, [shortId]);
  }

  async getMsgByLongId(longId: string): Promise<RawMessage | null> {
    if (this.msgCache.has(longId)) {
      return this.msgCache.get(longId)!;
    }
    return this.getMsg('SELECT * FROM msgs WHERE longId = ?', [longId]);
  }

  async getMsgBySeq(peerUid: string, seq: string): Promise<RawMessage | null> {
    const stmt = 'SELECT * FROM msgs WHERE peerUid = ? AND seq = ?';
    return this.getMsg(stmt, [peerUid, seq]);
  }

  async addMsg(msg: RawMessage, update = true): Promise<number> {
    const existMsg = await this.getMsgByLongId(msg.msgId);
    if (existMsg) {
      // logDebug('消息已存在，更新数据库', msg.msgId);
      if (update) this.updateMsg(msg).then();
      return existMsg.id!;
    }
    const stmt = this.db!.prepare('INSERT INTO msgs (shortId, longId, seq, peerUid, chatType) VALUES (?, ?, ?, ?, ?)');
    // const runAsync = promisify(stmt.run.bind(stmt));
    const shortId = ++this.globalMsgShortId;
    msg.id = shortId;
    //logDebug(`记录消息到数据库, 消息长id: ${msg.msgId}, 短id: ${msg.id}`);
    this.msgCache.set(shortId, msg);
    this.msgCache.set(msg.msgId, msg);
    stmt.run(this.globalMsgShortId, msg.msgId, msg.msgSeq.toString(), msg.peerUid, msg.chatType, (err: any) => {
      if (err) {
        if (err.errno === 19) {
          this.getMsgByLongId(msg.msgId).then((msg: RawMessage | null) => {
            if (msg) {
              this.msgCache.set(shortId, msg);
              this.msgCache.set(msg.msgId, msg);
              // logDebug('获取消息短id成功', msg.id);
            } else {
              logError('db could not get msg by long id', err);
            }
          }).catch(e => logError('db getMsgByLongId error', e));
        } else {
          logError('db could not add msg', err);
        }
      }
    });
    return shortId;
  }

  async updateMsg(msg: RawMessage) {
    const existMsg = this.msgCache.get(msg.msgId);
    if (existMsg) {
      Object.assign(existMsg, msg);
    }
    //logDebug(`更新消息, shortId:${msg.id}, seq: ${msg.msgSeq}, msgId: ${msg.msgId}`);
    const stmt = this.db!.prepare('UPDATE msgs SET seq=? WHERE longId=?');
    stmt.run(msg.msgSeq, msg.msgId, (err: any) => {
      if (err) {
        logError('updateMsg db error', err);
      }
    });

  }

  async addFileCache(file: DBFile) {
    const stmt = this.db!.prepare('INSERT INTO files (name, path, url, size, uuid, elementType ,element, elementId, msgId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    return new Promise((resolve, reject) => {
      stmt.run(file.name, file.path, file.url, file.size, file.uuid,
        file.elementType,
        JSON.stringify(file.element),
        file.elementId,
        file.msgId,
        function (err: any) {
          if (err) {
            logError('db could not add file', err);
            reject(err);
          }
          resolve(null);
        });
    });
  }

  private async getFileCache(query: string, params: any[]) {
    const stmt = this.db!.prepare(query);
    return new Promise<DBFile | null>((resolve, reject) => {
      stmt.get(...params, (err: any, row: DBFile & { element: string }) => {
        if (err) {
          logError('db could not get file cache', err);
          reject(err);
        }
        if (row) {
          row.element = JSON.parse(row.element);
        }
        resolve(row);
      });
    });
  }

  async getFileCacheByName(name: string): Promise<DBFile | null> {
    return this.getFileCache('SELECT * FROM files WHERE name = ?', [name]);
  }

  async getFileCacheByUuid(uuid: string): Promise<DBFile | null> {
    return this.getFileCache('SELECT * FROM files WHERE uuid = ?', [uuid]);
  }

  // todo: 是否所有的文件都有uuid？语音消息有没有uuid？
  async updateFileCache(file: DBFile) {
    const stmt = this.db!.prepare('UPDATE files SET path = ?, url = ? WHERE uuid = ?');
    return new Promise((resolve, reject) => {
      stmt.run(file.path, file.url, file.uuid, function (err: any) {
        if (err) {
          logError('db could not update file cache', err);
          reject(err);
        }
        resolve(null);
      });
    });
  }

  async getLastSentTimeAndJoinTime(
    groupId: number
  ): Promise<IRember[]> {
    logDebug('读取发言时间', groupId);
    return new Promise<IRember[]>((resolve, reject) => {
      this.db!.all(`SELECT * FROM "${groupId}" `, (err, rows: IRember[]) => {
        const cache = this.LURCache.get(groupId).map(e=>({user_id:e.userId, last_sent_time:e.value}));
        if (err) {
          logError('查询发言时间失败', groupId);
          return resolve(cache.map(e=>({...e, join_time:0})));
        }
         Object.assign(rows, cache)
        logDebug('查询发言时间成功', groupId, rows);
        resolve(rows);
      });
    });
  }

  insertLastSentTime(
    groupId: number,
    userId: number,
    time: number
  ) {
    this.LURCache.set(groupId, userId, time);
  }
  async insertJoinTime(
    groupId: number,
    userId: number,
    time: number
  ) {
    await this.createGroupInfoTimeTableIfNotExist(groupId);
    this.db!.all(
      `INSERT OR REPLACE INTO "${groupId}"  (user_id, last_sent_time, join_time) VALUES (?,?,?)`,
      [userId, time, time],
      (err) => {
        if (err)
          logError(err),
          Promise.reject(),
          logError('插入入群时间失败', userId, groupId);
      }
    );

  }
}


export const dbUtil = new DBUtil();
