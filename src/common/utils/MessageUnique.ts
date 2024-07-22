import crypto from 'crypto';

class CircularQueue<T> {
  private items: T[] = [];
  private front: number = 0;
  private maxSize: number;
  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  enqueue(item: T): void {
    if (this.items.length == this.maxSize) {
      this.front = (this.front + 1) % this.maxSize;
    }
    this.items[(this.front + this.items.length) % this.maxSize] = item;
  }

  dequeue(): T | undefined {
    return this.items.length == 0 ? undefined : this.items[(this.front + 1) % this.items.length];
  }

  size(): number {
    return this.items.length;
  }
}

class LimitedHashTable<K, V> {
  private keyToValue: Map<K, V> = new Map();
  private valueToKey: Map<V, K> = new Map();
  private keyQueue: CircularQueue<K> = new CircularQueue<K>(0);
  private valueQueue: CircularQueue<V> = new CircularQueue<V>(0);
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  private removeFromQueues(key: K, value: V): void {
    this.keyQueue.dequeue();
    this.valueQueue.dequeue();
  }

  set(key: K, value: V): void {
    let isExist = this.keyToValue.get(key);
    if (isExist && isExist === value) {
      return;
    }
    this.keyToValue.set(key, value);
    this.valueToKey.set(value, key);
    this.keyQueue.enqueue(key);
    this.valueQueue.enqueue(value);

    if (this.keyQueue.size() > this.maxSize || this.valueQueue.size() > this.maxSize) {
      const removedKey = this.keyQueue.dequeue();
      const removedValue = this.valueQueue.dequeue();
      if (removedKey !== undefined && removedValue !== undefined) {
        this.keyToValue.delete(removedKey);
        this.valueToKey.delete(removedValue);
        this.removeFromQueues(removedKey, removedValue);
      }
    }
  }

  getValue(key: K): V | undefined {
    return this.keyToValue.get(key);
  }

  getKey(value: V): K | undefined {
    return this.valueToKey.get(value);
  }

  deleteByValue(value: V) {
    const key = this.valueToKey.get(value);
    if (key !== undefined) {
      this.keyToValue.delete(key);
      this.valueToKey.delete(value);
      this.removeFromQueues(key, value);
    }
  }

  deleteByKey(key: K): void {
    const value = this.keyToValue.get(key);
    if (value !== undefined) {
      this.keyToValue.delete(key);
      this.valueToKey.delete(value);
      this.removeFromQueues(key, value);
    }
  }
}

class MessageUniqueWrapper {
  private msgIdMap: LimitedHashTable<string, number>;
  constructor(MaxMap: number = 1000) {
    this.msgIdMap = new LimitedHashTable<string, number>(MaxMap);
  }

  createMsg(MsgId: string) {
    const hash = crypto.createHash('sha256');
    hash.update(MsgId);
    const ShortId = parseInt(hash.digest('hex').slice(0, 8), 16);
    let isExist = this.msgIdMap.getKey(ShortId)
    if (isExist && isExist === MsgId) {
      return true;
    }
    return this.msgIdMap.set(MsgId, ShortId);
  }

  getMsgIdByShortId(ShortId: number) {
    return this.msgIdMap.getKey(ShortId);
  }

  getShortIdByMsgId(MsgId: string) {
    return this.msgIdMap.getValue(MsgId);
  }

  CreateMsgIdList(MsgIdList: string[]) {
    return MsgIdList.map((MsgId) => {
      return this.createMsg(MsgId);
    });
  }
}

export const MessageUnique = new MessageUniqueWrapper();