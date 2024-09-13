import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import fs from 'fs';
import { join as joinPath } from 'node:path';
import { calculateFileMD5, httpDownload } from '@/common/file';
import { randomUUID } from 'crypto';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

interface FileResponse {
    file: string;
}

const SchemaData = {
    type: 'object',
    properties: {
        thread_count: { type: ['number', 'string'] },
        url: { type: 'string' },
        base64: { type: 'string' },
        name: { type: 'string' },
        headers: {
            type: ['string', 'array'],
            items: {
                type: 'string',
            },
        },
    },
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class GoCQHTTPDownloadFile extends BaseAction<Payload, FileResponse> {
    actionName = ActionName.GoCQHTTP_DownloadFile;
    payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<FileResponse> {
        const isRandomName = !payload.name;
        const name = payload.name || randomUUID();
        const filePath = joinPath(this.core.NapCatTempPath, name);

        if (payload.base64) {
            fs.writeFileSync(filePath, payload.base64, 'base64');
        } else if (payload.url) {
            const headers = this.getHeaders(payload.headers);
            const buffer = await httpDownload({ url: payload.url, headers: headers });
            fs.writeFileSync(filePath, Buffer.from(buffer), 'binary');
        } else {
            throw new Error('不存在任何文件, 无法下载');
        }
        if (fs.existsSync(filePath)) {

            if (isRandomName) {
                // 默认实现要名称未填写时文件名为文件 md5
                const md5 = await calculateFileMD5(filePath);
                const newPath = joinPath(this.core.NapCatTempPath, md5);
                fs.renameSync(filePath, newPath);
                return { file: newPath };
            }
            return { file: filePath };
        } else {
            throw new Error('文件写入失败, 检查权限');
        }
    }

    getHeaders(headersIn?: string | string[]): Record<string, string> {
        const headers: Record<string, string> = {};
        if (typeof headersIn == 'string') {
            headersIn = headersIn.split('[\\r\\n]');
        }
        if (Array.isArray(headersIn)) {
            for (const headerItem of headersIn) {
                const spilt = headerItem.indexOf('=');
                if (spilt < 0) {
                    headers[headerItem] = '';
                } else {
                    const key = headerItem.substring(0, spilt);
                    headers[key] = headerItem.substring(spilt + 1);
                }
            }
        }
        if (!headers['Content-Type']) {
            headers['Content-Type'] = 'application/octet-stream';
        }
        return headers;
    }
}
