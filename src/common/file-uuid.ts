import { Peer } from '@/core';
import { randomUUID } from 'crypto';

interface FileUUIDData {
    peer: Peer;
    modelId?: string;
    fileId?: string;
    msgId?: string;
    elementId?: string;
    fileUUID?: string;
}

class TimeBasedCache<K, V> {
    private cache: Map<K, { value: V, timestamp: number }>;
    private ttl: number;

    constructor(ttl: number) {
        this.cache = new Map();
        this.ttl = ttl;
    }

    public put(key: K, value: V): void {
        const timestamp = Date.now();
        this.cache.set(key, { value, timestamp });
        this.cleanup();
    }

    public get(key: K): V | undefined {
        const entry = this.cache.get(key);
        if (entry) {
            const currentTime = Date.now();
            if (currentTime - entry.timestamp < this.ttl) {
                return entry.value;
            } else {
                this.cache.delete(key);
            }
        }
        return undefined;
    }

    private cleanup(): void {
        const currentTime = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (currentTime - entry.timestamp >= this.ttl) {
                this.cache.delete(key);
            }
        }
    }
}

class FileUUIDManager {
    private cache: TimeBasedCache<string, FileUUIDData>;

    constructor(ttl: number) {
        this.cache = new TimeBasedCache<string, FileUUIDData>(ttl);
    }

    public encode(data: FileUUIDData, endString: string = "", customUUID?: string): string {
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

    public encodeModelId(peer: Peer, modelId: string, fileId: string, fileUUID: string = "", endString: string = "", customUUID?: string): string {
        return this.manager.encode({ peer, modelId, fileId, fileUUID }, endString, customUUID);
    }

    public decodeModelId(uuid: string): FileUUIDData | undefined {
        return this.manager.decode(uuid);
    }

    public encode(peer: Peer, msgId: string, elementId: string, fileUUID: string = "", customUUID?: string): string {
        return this.manager.encode({ peer, msgId, elementId, fileUUID }, "", customUUID);
    }

    public decode(uuid: string): FileUUIDData | undefined {
        return this.manager.decode(uuid);
    }
}

export const FileNapCatOneBotUUID = new FileNapCatOneBotUUIDWrap();