import { ChatType, FileElement, NapCatCore } from '@/core';
import { NapCatLaanaAdapter } from '..';
import { File as LaanaFile } from '../types/entity/file';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { httpDownload } from '@/common/file';
import { randomUUID } from 'crypto';

export class LaanaFileUtils {
    cacheDir = path.join(this.laana.pathWrapper.cachePath, 'laana');

    constructor(
        public core: NapCatCore,
        public laana: NapCatLaanaAdapter,
    ) {
    }

    async resolveCacheIdFromLaanaFile(laanaFile: LaanaFile) {
        if (laanaFile.uri.oneofKind === 'cacheId') {
            return laanaFile.uri.cacheId;
        } else if (laanaFile.uri.oneofKind === 'url') {
            return this.createCacheFromUrl(laanaFile.uri.url);
        } else if (laanaFile.uri.oneofKind === 'raw') {
            return this.createCacheFromBytes(laanaFile.uri.raw);
        } else {
            throw Error('不支持的缓存类型');
        }
    }

    async toLocalPath(cacheId: string, forceRevalidate = false) {
        const cacheFilePath = path.join(this.cacheDir, cacheId);
        if (!fs.existsSync(cacheFilePath) || forceRevalidate) {
            if (cacheId.startsWith('@QQFileElement')) {
                const { msgId, chatType, peerUid, fileElementId } = this.decodeFileElementCacheId(cacheId);
                const downloadPath = await this.core.apis.FileApi.downloadMedia(
                    msgId,
                    chatType,
                    peerUid,
                    fileElementId,
                    '',
                    '',
                );
                await fsPromises.symlink(downloadPath, cacheFilePath);
            } else {
                throw Error(`请求的缓存不存在: ${cacheId}`);
            }
        }
        return path.join(this.cacheDir, cacheId);
    }

    async createCacheFromBytes(bytes: Uint8Array) {
        let cacheId = randomUUID();
        while (fs.existsSync(cacheId)) {
            cacheId = randomUUID();
        }
        await fsPromises.writeFile(path.join(this.cacheDir, cacheId), bytes);
        return cacheId;
    }

    async createCacheFromUrl(url: string) {
        return this.createCacheFromBytes(await httpDownload({ url }));
    }

    encodeFileElementToCacheId(
        msgId: string,
        chatType: ChatType,
        peerUid: string,
        fileElementId: string
    ) {
        return `QQFileElement@${msgId}@${chatType}@${peerUid}@${fileElementId}`;
    }

    decodeFileElementCacheId(cacheId: string) {
        if (!cacheId.startsWith('QQFileElement')) {
            throw Error('不支持的缓存 ID');
        }
        const [, msgId, chatType, peerUid, fileElementId] = cacheId.split('@');
        return {
            msgId,
            chatType: parseInt(chatType),
            peerUid,
            fileElementId
        };
    }
}
