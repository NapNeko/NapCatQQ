import {
    CacheFileListItem,
    CacheFileType,
    ChatCacheListItemBasic,
    ChatType,
    InstanceContext,
    NapCatCore,
} from '@/core';

export class NTQQCacheApi {
    context: InstanceContext;
    core: NapCatCore;

    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
    }

    async setCacheSilentScan(isSilent: boolean = true) {
        return '';
    }

    getCacheSessionPathList() {
        return '';
    }

    clearCache(cacheKeys: Array<string> = ['tmp', 'hotUpdate']) {
        // 参数未验证
        return this.context.session.getStorageCleanService().clearCacheDataByKeys(cacheKeys);
    }

    addCacheScannedPaths(pathMap: object = {}) {
        return this.context.session.getStorageCleanService().addCacheScanedPaths(pathMap);
    }

    scanCache() {
        //return (await this.context.session.getStorageCleanService().scanCache()).size;
    }

    getHotUpdateCachePath() {
        // 未实现
        return '';
    }

    getDesktopTmpPath() {
        // 未实现
        return '';
    }

    getChatCacheList(type: ChatType, pageSize: number = 1000, pageIndex: number = 0) {
        return this.context.session.getStorageCleanService().getChatCacheInfo(type, pageSize, 1, pageIndex);
    }

    getFileCacheInfo(fileType: CacheFileType, pageSize: number = 1000, lastRecord?: CacheFileListItem) {
        // const _lastRecord = lastRecord ? lastRecord : { fileType: fileType };
        // 需要五个参数
        // return napCatCore.session.getStorageCleanService().getFileCacheInfo();
    }

    async clearChatCache(chats: ChatCacheListItemBasic[] = [], fileKeys: string[] = []) {
        return this.context.session.getStorageCleanService().clearChatCacheInfo(chats, fileKeys);
    }
}
