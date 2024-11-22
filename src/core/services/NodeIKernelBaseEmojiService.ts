import { DownloadBaseEmojiByIdReq, DownloadBaseEmojiByUrlReq, GetBaseEmojiPathReq, PullSysEmojisReq } from '../types';

export interface NodeIKernelBaseEmojiService {
    removeKernelBaseEmojiListener(listenerId: number): void;

    addKernelBaseEmojiListener(listener: unknown): number;

    isBaseEmojiPathExist(args: Array<string>): unknown;

    fetchFullSysEmojis(pullSysEmojisReq: PullSysEmojisReq): unknown;

    getBaseEmojiPathByIds(getBaseEmojiPathReqs: Array<GetBaseEmojiPathReq>): unknown;

    downloadBaseEmojiByIdWithUrl(downloadBaseEmojiByUrlReq: DownloadBaseEmojiByUrlReq): unknown;

    downloadBaseEmojiById(downloadBaseEmojiByIdReq: DownloadBaseEmojiByIdReq): unknown;
}