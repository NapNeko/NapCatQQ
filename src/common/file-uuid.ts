import { Peer } from '@/core';
import { randomUUID } from 'crypto';

class TimeBasedCache<K, V> {
    private cache = new Map<K, { value: V, timestamp: number, frequency: number }>();
    private keyList = new Set<K>();
    private operationCount = 0;

    constructor(private maxCapacity: number, private ttl: number = 30 * 1000 * 60, private cleanupCount: number = 10) {}

    public put(key: K, value: V): void {
        const timestamp = Date.now();
        const cacheEntry = { value, timestamp, frequency: 1 };
        this.cache.set(key, cacheEntry);
        this.keyList.add(key);
        this.operationCount++;
        if (this.keyList.size > this.maxCapacity) this.evict();
        if (this.operationCount >= this.cleanupCount) this.cleanup(this.cleanupCount);
    }

    public get(key: K): V | undefined {
        const entry = this.cache.get(key);
        if (entry && Date.now() - entry.timestamp < this.ttl) {
            entry.timestamp = Date.now();
            entry.frequency++;
            this.operationCount++;
            if (this.operationCount >= this.cleanupCount) this.cleanup(this.cleanupCount);
            return entry.value;
        } else {
            this.deleteKey(key);
        }
        return undefined;
    }

    private cleanup(count: number): void {
        const currentTime = Date.now();
        let cleaned = 0;
        for (const key of this.keyList) {
            if (cleaned >= count) break;
            const entry = this.cache.get(key);
            if (entry && currentTime - entry.timestamp >= this.ttl) {
                this.deleteKey(key);
                cleaned++;
            }
        }
        this.operationCount = 0; // 重置操作计数器
    }

    private deleteKey(key: K): void {
        this.cache.delete(key);
        this.keyList.delete(key);
    }

    private evict(): void {
        while (this.keyList.size > this.maxCapacity) {
            let oldestKey: K | undefined;
            let minFrequency = Infinity;
            for (const key of this.keyList) {
                const entry = this.cache.get(key);
                if (entry && entry.frequency < minFrequency) {
                    minFrequency = entry.frequency;
                    oldestKey = key;
                }
            }
            if (oldestKey !== undefined) this.deleteKey(oldestKey);
        }
    }
}

interface FileUUIDData {
    peer: Peer;
    modelId?: string;
    fileId?: string;
    msgId?: string;
    elementId?: string;
    fileUUID?: string;
}

class FileUUIDManager {
    private cache: TimeBasedCache<string, FileUUIDData>;

    constructor(ttl: number) {
        this.cache = new TimeBasedCache<string, FileUUIDData>(5000, ttl);
    }

    public encode(data: FileUUIDData, endString: string = '', customUUID?: string): string {
        const uuid = customUUID ? customUUID : randomUUID().replace(/-/g, '') + endString;
        this.cache.put(uuid, data);
        return uuid;
    }

    public decode(uuid: string): FileUUIDData | undefined {
        return this.cache.get(uuid);
    }
}

export class FileNapCatOneBotUUIDWrap {
    private manager: FileUUIDManager;

    constructor(ttl: number = 86400000) {
        this.manager = new FileUUIDManager(ttl);
    }

    public encodeModelId(peer: Peer, modelId: string, fileId: string, fileUUID: string = '', endString: string = '', customUUID?: string): string {
        return this.manager.encode({ peer, modelId, fileId, fileUUID }, endString, customUUID);
    }

    public decodeModelId(uuid: string): FileUUIDData | undefined {
        return this.manager.decode(uuid);
    }

    public encode(peer: Peer, msgId: string, elementId: string, fileUUID: string = '', customUUID?: string): string {
        return this.manager.encode({ peer, msgId, elementId, fileUUID }, '', customUUID);
    }

    public decode(uuid: string): FileUUIDData | undefined {
        return this.manager.decode(uuid);
    }
}

export const FileNapCatOneBotUUID = new FileNapCatOneBotUUIDWrap();