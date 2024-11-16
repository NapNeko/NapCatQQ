import { ChatType } from './msg';

export interface CacheScanResult {
    result: number;
    size: [ // 单位为字节
        string, // 系统总存储空间
        string, // 系统可用存储空间
        string, // 系统已用存储空间
        string, // QQ总大小
        string, // 「聊天与文件」大小
        string, // 未知
        string, // 「缓存数据」大小
        string, // 「其他数据」大小
        string, // 未知
    ];
}

export interface ChatCacheList {
    pageCount: number;
    infos: ChatCacheListItem[];
}

export interface ChatCacheListItem {
    chatType: ChatType;
    basicChatCacheInfo: ChatCacheListItemBasic;
    guildChatCacheInfo: unknown[]; // TODO: 没用过频道所以不知道这里边的详细内容
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

export enum CacheFileType {
    IMAGE = 0,
    VIDEO = 1,
    AUDIO = 2,
    DOCUMENT = 3,
    OTHER = 4,
}

export interface CacheFileList {
    infos: CacheFileListItem[],
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
