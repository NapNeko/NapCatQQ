import { GetFileListParam } from "../entities";
import { GeneralCallResult } from "./common";
export interface NodeIKernelRichMediaService {
    getVideoPlayUrl(arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown, arg5: unknown): unknown;
    getVideoPlayUrlV2(arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown, arg5: unknown): unknown;
    getRichMediaFileDir(arg1: unknown, arg2: unknown, arg3: unknown): unknown;
    getVideoPlayUrlInVisit(arg: unknown): unknown;
    isFileExpired(arg: unknown): unknown;
    deleteGroupFolder(GroupCode: string, FolderId: string): Promise<GeneralCallResult & {
        groupFileCommonResult: {
            retCode: number;
            retMsg: string;
            clientWording: string;
        };
    }>;
    downloadRichMediaInVisit(arg: unknown): unknown;
    downloadFileForModelId(arg1: unknown, arg2: unknown, arg3: unknown): unknown;
    downloadFileForFileUuid(arg1: unknown, arg2: unknown, arg3: unknown): unknown;
    downloadFileByUrlListtransgroupfile(arg1: unknown, arg2: unknown): unknown;
    downloadFileForFileInfotransgroupfile(arg1: unknown, arg2: unknown): unknown;
    createGroupFolder(GroupCode: string, FolderName: string): Promise<GeneralCallResult & {
        resultWithGroupItem: {
            result: any;
            groupItem: Array<any>;
        };
    }>;
    downloadFile(arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown): unknown;
    createGroupFoldertransgroupfile(arg1: unknown, arg2: unknown): unknown;
    downloadGroupFolder(arg1: unknown, arg2: unknown, arg3: unknown): unknown;
    renameGroupFolder(arg1: unknown, arg2: unknown, arg3: unknown): unknown;
    deleteGroupFoldertransgroupfile(arg1: unknown, arg2: unknown): unknown;
    deleteTransferInfotransgroupfile(arg1: unknown, arg2: unknown): unknown;
    cancelTransferTask(arg1: unknown, arg2: unknown, arg3: unknown): unknown;
    cancelUrlDownload(arg: unknown): unknown;
    updateOnlineVideoElemStatus(arg: unknown): unknown;
    getGroupSpace(arg: unknown): unknown;
    getGroupFileList(groupCode: string, params: GetFileListParam): Promise<GeneralCallResult & {
        groupSpaceResult: {
            retCode: number;
            retMsg: string;
            clientWording: string;
            totalSpace: number;
            usedSpace: number;
            allUpload: boolean;
        };
    }>;
    getGroupFileInfotransgroupfile(arg1: unknown, arg2: unknown): unknown;
    getGroupFileListtransgroupfile(arg1: unknown, arg2: unknown): unknown;
    getGroupTransferListtransgroupfile(arg1: unknown, arg2: unknown): unknown;
    renameGroupFile(arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown, arg5: unknown): unknown;
    moveGroupFile(arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown, arg5: unknown): unknown;
    transGroupFile(arg1: unknown, arg2: unknown): unknown;
    searchGroupFileByWord(arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown, arg5: unknown): unknown;
    deleteGroupFile(GroupCode: string, params: Array<number>, Files: Array<string>): Promise<GeneralCallResult & {
        transGroupFileResult: {
            result: any;
            successFileIdList: Array<any>;
            failFileIdList: Array<any>;
        };
    }>;
    translateEnWordToZn(words: string[]): Promise<GeneralCallResult & {
        words: string[];
    }>;
    getScreenOCR(arg: unknown): unknown;
    batchGetGroupFileCount(Gids: Array<string>): Promise<GeneralCallResult & {
        groupCodes: Array<string>;
        groupFileCounts: Array<number>;
    }>;
    queryPicDownloadSize(arg: unknown): unknown;
    searchGroupFiletransgroupfile(arg1: unknown, arg2: unknown): unknown;
    searchMoreGroupFile(arg: unknown): unknown;
    cancelSearcheGroupFile(arg1: unknown, arg2: unknown, arg3: unknown): unknown;
    onlyDownloadFile(arg1: unknown, arg2: unknown, arg3: unknown): unknown;
    onlyUploadFiletransgroupfile(arg1: unknown, arg2: unknown): unknown;
    isExtraLargePic(arg1: unknown, arg2: unknown, arg3: unknown): unknown;
    uploadRMFileWithoutMsg(arg: unknown): unknown;
    isNull(): boolean;
}
