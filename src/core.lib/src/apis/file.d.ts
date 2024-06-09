import { CacheFileListItem, CacheFileType, ChatCacheListItemBasic, ChatType, ElementType, RawMessage } from '@/core/entities';
import { GeneralCallResult } from '@/core';
import * as fileType from 'file-type';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
export declare class NTQQFileApi {
    static getFileType(filePath: string): Promise<fileType.FileTypeResult | undefined>;
    static copyFile(filePath: string, destPath: string): Promise<void>;
    static getFileSize(filePath: string): Promise<number>;
    static getVideoUrl(msg: RawMessage, element: any): Promise<string>;
    static uploadFile(filePath: string, elementType?: ElementType, elementSubType?: number): Promise<{
        md5: string;
        fileName: string;
        path: string;
        fileSize: number;
        ext: string;
    }>;
    static downloadMedia(msgId: string, chatType: ChatType, peerUid: string, elementId: string, thumbPath: string, sourcePath: string, timeout?: number, force?: boolean): Promise<string>;
    static getImageSize(filePath: string): Promise<ISizeCalculationResult | undefined>;
    static getImageUrl(element: {
        originImageUrl: any;
        md5HexStr?: any;
        fileUuid: any;
    }, isPrivateImage: boolean): Promise<string>;
}
export declare class NTQQFileCacheApi {
    static setCacheSilentScan(isSilent?: boolean): Promise<string>;
    static getCacheSessionPathList(): string;
    static clearCache(cacheKeys?: Array<string>): unknown;
    static addCacheScannedPaths(pathMap?: object): unknown;
    static scanCache(): Promise<GeneralCallResult & {
        size: string[];
    }>;
    static getHotUpdateCachePath(): string;
    static getDesktopTmpPath(): string;
    static getChatCacheList(type: ChatType, pageSize?: number, pageIndex?: number): unknown;
    static getFileCacheInfo(fileType: CacheFileType, pageSize?: number, lastRecord?: CacheFileListItem): void;
    static clearChatCache(chats?: ChatCacheListItemBasic[], fileKeys?: string[]): Promise<unknown>;
}
