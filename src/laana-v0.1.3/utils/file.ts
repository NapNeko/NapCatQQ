import { NapCatCore } from '@/core';
import { NapCatLaanaAdapter } from '..';
import { File as LaanaFile } from '@/laana-v0.1.3/types/entity/file';
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
            const cacheFilePath = path.join(this.cacheDir, laanaFile.uri.cacheId);
            if (!fs.existsSync(cacheFilePath)) {
                throw Error(`请求的缓存不存在: ${laanaFile.uri.cacheId}`);
            }
            return laanaFile.uri.cacheId;
        } else if (laanaFile.uri.oneofKind === 'url') {
            return this.createCacheFromUrl(laanaFile.uri.url);
        } else if (laanaFile.uri.oneofKind === 'raw') {
            return this.createCacheFromBytes(laanaFile.uri.raw);
        } else {
            throw Error('不支持的缓存类型');
        }
    }

    toLocalPath(cacheId: string) {
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
}
