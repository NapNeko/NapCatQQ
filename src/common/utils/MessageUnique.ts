import { Peer } from '@/core';
import crypto, { randomInt, randomUUID } from 'crypto';

class LimitedHashTable<K, V> {
  private keyToValue: Map<K, V> = new Map();
  private valueToKey: Map<V, K> = new Map();
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }
  resize(count: number) {
    this.maxSize = count;
  }

  set(key: K, value: V): void {
    const isExist = this.keyToValue.get(key);
    if (isExist && isExist === value) {
      return;
    }
    this.keyToValue.set(key, value);
    this.valueToKey.set(value, key);
    while (this.keyToValue.size !== this.valueToKey.size) {
      console.log('keyToValue.size !== valueToKey.size Error Atom');
      this.keyToValue.clear();
      this.valueToKey.clear();
    }
    // console.log('---------------');
    // console.log(this.keyToValue);
    // console.log(this.valueToKey);
    // console.log('---------------');
    while (this.keyToValue.size > this.maxSize || this.valueToKey.size > this.maxSize) {
      console.log(this.keyToValue.size > this.maxSize, this.valueToKey.size > this.maxSize);
      const oldestKey = this.keyToValue.keys().next().value;
      this.valueToKey.delete(this.keyToValue.get(oldestKey)!);
      this.keyToValue.delete(oldestKey);
    }
  }

  getValue(key: K): V | undefined {
    return this.keyToValue.get(key);
  }

  getKey(value: V): K | undefined {
    return this.valueToKey.get(value);
  }

  deleteByValue(value: V): void {
    const key = this.valueToKey.get(value);
    if (key !== undefined) {
      this.keyToValue.delete(key);
      this.valueToKey.delete(value);
    }
  }

  deleteByKey(key: K): void {
    const value = this.keyToValue.get(key);
    if (value !== undefined) {
      this.keyToValue.delete(key);
      this.valueToKey.delete(value);
    }
  }
}

class MessageUniqueWrapper {
  private msgDataMap: LimitedHashTable<string, number>;
  private msgIdMap: LimitedHashTable<string, number>;
  constructor(maxMap: number = 1000) {
    this.msgIdMap = new LimitedHashTable<string, number>(maxMap);
    this.msgDataMap = new LimitedHashTable<string, number>(maxMap);
  }

  createMsg(peer: Peer, msgId: string): number | undefined {
    const key = `${msgId}|${peer.chatType}|${peer.peerUid}`;
    const hash = crypto.createHash('sha1').update(key);
    const shortId = parseInt(hash.digest('hex').slice(0, 8), 16);
    const isExist = this.msgIdMap.getKey(shortId);
    console.log(`${peer.peerUid} ${msgId} ------- ${shortId}`);
    if (isExist && isExist === msgId) {
      return shortId;
    }
    this.msgIdMap.set(msgId, shortId);
    this.msgDataMap.set(key, shortId);
    return shortId;
  }

  getMsgIdAndPeerByShortId(shortId: number): { MsgId: string; Peer: Peer } | undefined {
    const data = this.msgDataMap.getKey(shortId);
    if (data) {
      const [msgId, chatTypeStr, peerUid] = data.split('|');
      const peer: Peer = {
        chatType: parseInt(chatTypeStr),
        peerUid,
        guildId: '',
      };
      return { MsgId: msgId, Peer: peer };
    }
    return undefined;
  }

  getShortIdByMsgId(msgId: string): number | undefined {
    return this.msgIdMap.getValue(msgId);
  }
  getPeerByMsgId(msgId: string) {
    const shortId = this.msgIdMap.getValue(msgId);
    if (!shortId) return undefined;
    return this.getMsgIdAndPeerByShortId(shortId);
  }
  resize(maxSize: number): void {
    this.msgIdMap.resize(maxSize);
    this.msgDataMap.resize(maxSize);
  }
}

export const MessageUnique: MessageUniqueWrapper = new MessageUniqueWrapper();