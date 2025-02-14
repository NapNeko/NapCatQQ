import { DownloadBaseEmojiByIdReq, DownloadBaseEmojiByUrlReq, GetBaseEmojiPathReq, PullSysEmojisReq } from '../types';
import { GeneralCallResult } from './common';

export interface NodeIKernelBaseEmojiService {
    removeKernelBaseEmojiListener(listenerId: number): void;

    addKernelBaseEmojiListener(listener: unknown): number;

    isBaseEmojiPathExist(args: Array<string>): unknown;

    fetchFullSysEmojis(pullSysEmojisReq: PullSysEmojisReq): Promise<GeneralCallResult & {
        rsp: {
            otherPanelResult: {
                SysEmojiGroupList: Array<unknown>,
                downloadInfo: Array<unknown>
            },
            normalPanelResult: {
                SysEmojiGroupList: Array<unknown>,
                downloadInfo: Array<unknown>
            },
            superPanelResult: {
                SysEmojiGroupList: Array<unknown>,
                downloadInfo: Array<unknown>
            },
            redHeartPanelResult: {
                SysEmojiGroupList: Array<unknown>,
                downloadInfo: Array<unknown>
            }
        }
    }>;

    getBaseEmojiPathByIds(getBaseEmojiPathReqs: Array<GetBaseEmojiPathReq>): unknown;

    downloadBaseEmojiByIdWithUrl(downloadBaseEmojiByUrlReq: DownloadBaseEmojiByUrlReq): unknown;

    downloadBaseEmojiById(downloadBaseEmojiByIdReq: DownloadBaseEmojiByIdReq): unknown;
}