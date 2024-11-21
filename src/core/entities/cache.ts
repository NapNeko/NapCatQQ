import { ChatType } from './msg';

/**
 * 聊天缓存列表
 */
export interface ChatCacheList {
    pageCount: number; // 页数
    infos: ChatCacheListItem[]; // 聊天缓存项列表
}

/**
 * 聊天缓存列表项
 */
export interface ChatCacheListItem {
    chatType: ChatType; // 聊天类型
    basicChatCacheInfo: ChatCacheListItemBasic; // 基本聊天缓存信息
    guildChatCacheInfo: unknown[]; // 公会聊天缓存信息
}

/**
 * 基本聊天缓存信息
 */
export interface ChatCacheListItemBasic {
    chatSize: string; // 聊天大小
    chatTime: string; // 聊天时间
    uid: string; // 用户ID
    uin: string; // 用户号码
    remarkName: string; // 备注名
    nickName: string; // 昵称
    chatType?: ChatType; // 聊天类型（可选）
    isChecked?: boolean; // 是否已检查（可选）
}

/**
 * 缓存文件类型枚举
 */
export enum CacheFileType {
    IMAGE = 0, // 图片
    VIDEO = 1, // 视频
    AUDIO = 2, // 音频
    DOCUMENT = 3, // 文档
    OTHER = 4, // 其他
}

/**
 * 缓存文件列表
 */
export interface CacheFileList {
    infos: CacheFileListItem[]; // 缓存文件项列表
}

/**
 * 缓存文件列表项
 */
export interface CacheFileListItem {
    fileSize: string; // 文件大小
    fileTime: string; // 文件时间
    fileKey: string; // 文件键
    elementId: string; // 元素ID
    elementIdStr: string; // 元素ID字符串
    fileType: CacheFileType; // 文件类型
    path: string; // 路径
    fileName: string; // 文件名
    senderId: string; // 发送者ID
    previewPath: string; // 预览路径
    senderName: string; // 发送者名称
    isChecked?: boolean; // 是否已检查（可选）
}