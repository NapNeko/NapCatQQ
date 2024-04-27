import { ChatType } from './msg';
export interface CacheScanResult {
    result: number;
    size: [
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string
    ];
}
export interface ChatCacheList {
    pageCount: number;
    infos: ChatCacheListItem[];
}
export interface ChatCacheListItem {
    chatType: ChatType;
    basicChatCacheInfo: ChatCacheListItemBasic;
    guildChatCacheInfo: unknown[];
}
export interface ChatCacheListItemBasic {
    chatSize: string;
    chatTime: string;
    uid: string;
    uin: string;
    remarkName: string;
    nickName: string;
    chatType?: ChatType;
    isChecked?: boolean;
}
export declare enum CacheFileType {
    IMAGE = 0,
    VIDEO = 1,
    AUDIO = 2,
    DOCUMENT = 3,
    OTHER = 4
}
export interface CacheFileList {
    infos: CacheFileListItem[];
}
export interface CacheFileListItem {
    fileSize: string;
    fileTime: string;
    fileKey: string;
    elementId: string;
    elementIdStr: string;
    fileType: CacheFileType;
    path: string;
    fileName: string;
    senderId: string;
    previewPath: string;
    senderName: string;
    isChecked?: boolean;
}
