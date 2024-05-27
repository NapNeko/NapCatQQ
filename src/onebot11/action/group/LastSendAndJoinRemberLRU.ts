import sqlite3 from "sqlite3";
import { logError, logDebug } from "@/common/utils/log";
import { selfInfo } from "@/core/data";
import { ob11Config } from "@/onebot11/config";
import LRU from "./LRUCache";
import path from "path";

const dbPath = path.join(
  ob11Config.getConfigDir(),
  `lastSendAndJoinRember_${selfInfo.uin}.db`
);
const remberDb = new sqlite3.Database(dbPath);

// 初始化全部的群到内存中
const groupIds: number[] = [];
remberDb.serialize(() => {
  const sql = `SELECT * FROM sqlite_master WHERE type='table'`;
  remberDb.all(sql, [], (err, rows: { name: string }[]) => {
    if (err) return logError(err);
    rows.forEach((row) => groupIds.push(parseInt(row.name)));
    logDebug(`已加载 ${groupIds.length} 个群`);
    console.log(groupIds);
  });
});

const createTableSQL = (groupId: number) =>
  `CREATE TABLE IF NOT EXISTS "${groupId}" (
        user_id INTEGER,
        last_sent_time INTEGER,
        join_time INTEGER,
        PRIMARY KEY (user_id)
    );`;

async function createTableIfNotExist(groupId: number) {
  // 未开启本地记录
  if (!ob11Config.localDB) return;

  logDebug("检测数据表存在", groupId);
  if (groupIds.includes(groupId)) {
    logDebug("数据表已存在", groupId);
    return;
  }

  logDebug("创建数据表", groupId);
  return new Promise((resolve, reject) => {
    const sql = createTableSQL(groupId);
    remberDb.all(sql, (err) => {
      if (err) {
        logError("数据表创建失败", err);
        reject(err);
        return;
      }
      groupIds.push(groupId);
      logDebug("数据表创建成功", groupId);
      resolve(true);
    });
  });
}

// 入群记录
export async function insertJoinTime(
  groupId: number,
  userId: number,
  time: number
) {
  // 未开启本地记录
  if (!ob11Config.localDB) return;

  logDebug("插入入群时间", userId, groupId);
  await createTableIfNotExist(groupId);
  remberDb.all(
    `INSERT OR REPLACE INTO "${groupId}"  (user_id, last_sent_time, join_time) VALUES (?,?,?)`,
    [userId, time, time],
    (err) => {
      if (err)
        logError(err),
          Promise.reject(),
          console.log("插入入群时间失败", userId, groupId);
    }
  );
}

// 发言记录
const LURCache = new LRU<number>();
const LastSentCache = new (class {
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

LURCache.on(async (node) => {
  const { value: time, groupId, userId } = node;

  logDebug("插入发言时间", userId, groupId);
  await createTableIfNotExist(groupId);

  const method = await getDataSetMethod(groupId, userId);
  logDebug("插入发言时间方法判断", userId, groupId, method);

  const sql =
    method == "update"
      ? `UPDATE "${groupId}" SET last_sent_time = ? WHERE user_id = ?`
      : `INSERT INTO "${groupId}" (last_sent_time, user_id)  VALUES (?, ?)`;

  remberDb.all(sql, [time, userId], (err) => {
    if (err) {
      return logError("插入/更新发言时间失败", userId, groupId);
    }
    logDebug("插入/更新发言时间成功", userId, groupId);
  });
});

async function getDataSetMethod(groupId: number, userId: number) {
  // 缓存记录
  if (LastSentCache.get(groupId, userId)) {
    logDebug("缓存命中", userId, groupId);
    return "update";
  }

  // 数据库判断
  return new Promise<"insert" | "update">((resolve, reject) => {
    remberDb.all(
      `SELECT * FROM "${groupId}" WHERE user_id = ?`,
      [userId],
      (err, rows) => {
        if (err) {
          logError("查询发言时间存在失败", userId, groupId, err);
          return logError("插入发言时间失败", userId, groupId, err);
        }

        if (rows.length === 0) {
          logDebug("查询发言时间不存在", userId, groupId);
          return resolve("insert");
        }

        logDebug("查询发言时间存在", userId, groupId);
        resolve("update");
      }
    );
  });
}

interface IRember {
  last_sent_time: number;
  join_time: number;
  user_id: number;
}
export async function getLastSentTimeAndJoinTime(
  groupId: number
): Promise<IRember[]> {
  logDebug("读取发言时间", groupId);
  return new Promise<IRember[]>((resolve, reject) => {
    remberDb.all(`SELECT * FROM "${groupId}" `, (err, rows: IRember[]) => {
      if (err) {
        logError("查询发言时间失败", groupId);
        return resolve([]);
      }
      logDebug("查询发言时间成功", groupId, rows);
      resolve(rows);
    });
  });
}

export function insertLastSentTime(
  groupId: number,
  userId: number,
  time: number
) {
  if (!ob11Config.localDB) return;
  LURCache.set(groupId, userId,time)
}
