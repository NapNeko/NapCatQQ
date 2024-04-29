import { ElementType, FileElement, PicElement, PttElement, RawMessage, VideoElement } from '../entities';
import sqlite3 from 'sqlite3';
type DBFile = {
    name: string;
    path: string;
    url: string;
    size: number;
    uuid: string;
    msgId: string;
    elementId: string;
    element: PicElement | VideoElement | FileElement | PttElement;
    elementType: ElementType.PIC | ElementType.VIDEO | ElementType.FILE | ElementType.PTT;
};
declare class DBUtilBase {
    protected db: sqlite3.Database | undefined;
    init(dbPath: string): Promise<void>;
    protected createTable(): void;
    close(): void;
}
declare class DBUtil extends DBUtilBase {
    private msgCache;
    private globalMsgShortId;
    constructor();
    init(dbPath: string): Promise<void>;
    protected createTable(): void;
    private getCurrentMaxShortId;
    private getMsg;
    getMsgByShortId(shortId: number): Promise<RawMessage | null>;
    getMsgByLongId(longId: string): Promise<RawMessage | null>;
    getMsgBySeq(peerUid: string, seq: string): Promise<RawMessage | null>;
    addMsg(msg: RawMessage, update?: boolean): Promise<number>;
    updateMsg(msg: RawMessage): Promise<void>;
    addFileCache(file: DBFile): Promise<unknown>;
    private getFileCache;
    getFileCacheByName(name: string): Promise<DBFile | null>;
    getFileCacheByUuid(uuid: string): Promise<DBFile | null>;
    updateFileCache(file: DBFile): Promise<unknown>;
    getReceivedTempUinMap(): Promise<Record<string, string>>;
    getUidByTempUin(uid: string): Promise<string>;
    addTempUin(uin: string, uid: string): Promise<unknown>;
}
export declare const dbUtil: DBUtil;
export {};
