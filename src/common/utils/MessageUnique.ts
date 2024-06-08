import crypto from 'crypto';

class LimitedHashTable<K, V> {
    private keyToValue: Map<K, V> = new Map();
    private valueToKey: Map<V, K> = new Map();
    private maxSize: number;
    private KeyQueneList: K[] = [];
    private ValueQueneList: V[] = [];
    constructor(maxSize: number) {
        this.maxSize = maxSize;
    }
    set(key: K, value: V): void {
        this.keyToValue.set(key, value);
        this.valueToKey.set(value, key);
        if (this.KeyQueneList.length >= this.maxSize || this.ValueQueneList.length >= this.maxSize) {
            this.KeyQueneList.shift();
            this.ValueQueneList.shift();
        }
    }

    getValue(key: K): V | undefined {
        return this.keyToValue.get(key);
    }

    getKey(value: V): K | undefined {
        return this.valueToKey.get(value);
    }

    delete(key: K): void {
        const value = this.keyToValue.get(key);
        if (value !== undefined) {
            this.keyToValue.delete(key);
            this.valueToKey.delete(value);
        }
    }
}

class MessageUniqueWrapper {
    private msgIdMap: LimitedHashTable<number, string> = new LimitedHashTable(1000);
    createMsg(MsgId: string) {
        let ShortId = parseInt(crypto.createHash('sha1').update('2345').digest('hex').slice(0, 8), 16);
        this.msgIdMap.set(ShortId, MsgId);
        return ShortId;
    }
    getMsgIdByShortId(ShortId: number) {
        return this.msgIdMap.getValue(ShortId);
    }
    getShortIdByMsgId(MsgId: string) {
        return this.msgIdMap.getKey(MsgId);
    }
}

export const MessageUnique = new MessageUniqueWrapper();