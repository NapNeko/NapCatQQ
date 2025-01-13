import { Peer } from '@/core';
import { LRUCache } from './lru-cache';
import { randomUUID } from 'crypto';

interface FileUUIDData {
    peer: Peer;
    modelId?: string;
    fileId?: string;
    msgId?: string;
    elementId?: string;
    fileUUID?: string;
}

class FileUUIDManager {
    private cache: LRUCache<string, FileUUIDData>;

    constructor(capacity: number) {
        this.cache = new LRUCache<string, FileUUIDData>(capacity);
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

    constructor(capacity: number = 100) {
        this.manager = new FileUUIDManager(capacity);
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