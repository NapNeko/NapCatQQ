import { ElementType, FileElement, PicElement, PttElement, RawMessage, VideoElement } from '@/core/qqnt/entities';

import sqlite3 from 'sqlite3';
import { log } from '@/common/utils/log';

type DBMsg = {
  id: number,
  longId: string,
  seq: number,
  peerUid: string,
  msg: string
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

  createConnection(dbPath: string) {
    if (this.db) {
      return;
    }
    this.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        log('Could not connect to database', err);
        return;
      }
      this.createTable();
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
  private msgCache: Map<string, RawMessage> = new Map<string, RawMessage>();

  constructor() {
    super();
    const interval = 1000 * 60 * 10;  // 10分钟清理一次缓存
    setInterval(() => {
      log('清理消息缓存');
      this.msgCache.forEach((msg, key) => {
        if ((Date.now() - parseInt(msg.msgTime) * 1000) > interval) {
          this.msgCache.delete(key);
        }
      });
    }, interval);
  }


  protected createTable() {
    // 消息记录
    const createTableSQL = `
            CREATE TABLE IF NOT EXISTS msgs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                long_id TEXT NOT NULL UNIQUE,
                seq INTEGER NOT NULL,
                peer_uid TEXT NOT NULL,
                msg TEXT NOT NULL
            )`;
    this.db!.run(createTableSQL, function (err) {
      if (err) {
        log('Could not create table', err);
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
        log('Could not create table files', err);
      }
    });

    // 接收到的临时会话消息uid
    const createTempUinTableSQL = `
            CREATE TABLE IF NOT EXISTS temp_uins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uid TEXT,
                uin TEXT
            )`;
    this.db!.run(createTempUinTableSQL, function (err) {
      if (err) {
        log('Could not create table temp_uins', err);
      }
    });
  }

  private async getMsg(query: string, params: any[]) {
    const stmt = this.db!.prepare(query);
    return new Promise<RawMessage | null>((resolve, reject) => {
      stmt.get(...params, (err: any, row: DBMsg) => {
        // log("getMsg", row, err);
        if (err) {
          log('Could not get msg by short id', err);
          resolve(null);
        }
        try {
          const msg = JSON.parse(row.msg);
          msg.id = row.id;
          return resolve(msg);
        } catch (e) {
          return resolve(null);
        }
      });
    });
  }

  async getMsgByShortId(shortId: number): Promise<RawMessage | null> {
    const getStmt = 'SELECT * FROM msgs WHERE id = ?';
    return this.getMsg(getStmt, [shortId]);
  }

  async getMsgByLongId(longId: string): Promise<RawMessage | null> {
    if (this.msgCache.has(longId)) {
      return this.msgCache.get(longId)!;
    }
    return this.getMsg('SELECT * FROM msgs WHERE long_id = ?', [longId]);
  }

  async getMsgBySeq(peerUid: string, seq: string): Promise<RawMessage | null> {
    const stmt = 'SELECT * FROM msgs WHERE peer_uid = ? AND seq = ?';
    return this.getMsg(stmt, [peerUid, seq]);
  }

  async addMsg(msg: RawMessage, update = true): Promise<number> {
    log('正在记录消息到数据库', msg.msgId);
    const existMsg = await this.getMsgByLongId(msg.msgId);
    if (existMsg) {
      // log('消息已存在，更新数据库', msg.msgId);
      if (update) this.updateMsg(msg).then();
      return existMsg.id!;
    }
    const stmt = this.db!.prepare('INSERT INTO msgs (long_id, seq, peer_uid, msg) VALUES (?, ?, ?, ?)');

    // const runAsync = promisify(stmt.run.bind(stmt));
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const dbInstance = this;
      stmt.run(msg.msgId, msg.msgSeq, msg.peerUid, JSON.stringify(msg), function (err: any) {
        if (err) {
          if (err.errno === 19) {
            // log('消息已存在，更新数据库', msg.msgId);
            dbInstance.getMsgByLongId(msg.msgId).then((msg: RawMessage | null) => {
              if (msg) {
                dbInstance.msgCache.set(msg.msgId, msg);
                // log('获取消息短id成功', msg.id);
                resolve(msg.id!);
              } else {
                log('db could not get msg by long id', err);
                resolve(-1);
              }
            });
          } else {
            log('db could not add msg', err);
            resolve(-1);
          }
        } else {
          // log("addMsg", this);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          msg.id = this.lastID;
          dbInstance.msgCache.set(msg.msgId, msg);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // log('获取消息短id成功', this.lastID);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          resolve(this.lastID);
        }
      });
    });
  }

  async updateMsg(msg: RawMessage) {
    const existMsg = this.msgCache.get(msg.msgId);
    if (existMsg) {
      Object.assign(existMsg, msg);
    }
    const stmt = this.db!.prepare('UPDATE msgs SET msg = ?, seq = ? WHERE long_id = ?');
    try {
      stmt.run(JSON.stringify(msg), msg.msgSeq, msg.msgId);
    } catch (e) {
      log('updateMsg db error', e);
    }
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
            log('db could not add file', err);
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
          log('db could not get file cache', err);
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
      stmt.run(file.path, file.url, function (err: any) {
        if (err) {
          log('db could not update file cache', err);
          reject(err);
        }
        resolve(null);
      });
    });
  }

  // 被动收到的临时会话消息uin->uid
  async getReceivedTempUinMap() {
    const stmt = 'SELECT * FROM temp_uins';
    return new Promise<Record<string, string>>((resolve, reject) => {
      this.db!.all(stmt, (err, rows: { uin: string, uid: string }[]) => {
        if (err) {
          log('db could not get temp uin map', err);
          reject(err);
        }
        const map: Record<string, string> = {};
        rows.forEach(row => {
          map[row.uin] = row.uid;
        });
        resolve(map);
      });
    });
  }

  // 通过uin获取临时会话消息uid
  async getUidByTempUin(uid: string) {
    const stmt = 'SELECT * FROM temp_uins WHERE uin = ?';
    return new Promise<string>((resolve, reject) => {
      this.db!.get(stmt, [uid], (err, row: { uin: string, uid: string }) => {
        if (err) {
          log('db could not get temp uin map', err);
          reject(err);
        }
        resolve(row?.uid);
      });
    });
  }

  async addTempUin(uin: string, uid: string) {
    const existUid = await this.getUidByTempUin(uin);
    if (!existUid) {
      const stmt = this.db!.prepare('INSERT INTO temp_uins (uin, uid) VALUES (?, ?)');
      return new Promise((resolve, reject) => {
        stmt.run(uin, uid, function (err: any) {
          if (err) {
            log('db could not add temp uin', err);
            reject(err);
          }
          resolve(null);
        });
      });
    }
  }
}


export const dbUtil = new DBUtil();
