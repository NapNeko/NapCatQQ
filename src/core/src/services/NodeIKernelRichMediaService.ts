import { GetFileListParam, Peer } from "../entities";
import { GeneralCallResult } from "./common";

export interface NodeIKernelRichMediaService {
    //getVideoPlayUrl(peer, msgId, elemId, videoCodecFormat, VideoRequestWay.KHAND, cb);
    // public enum VideoCodecFormatType {
    //     KCODECFORMATH264,
    //     KCODECFORMATH265,
    //     KCODECFORMATH266,
    //     KCODECFORMATAV1
    // }
    // public enum VideoRequestWay {
    //     KUNKNOW,
    //     KHAND,
    //     KAUTO
    // }
    getVideoPlayUrl(peer: Peer, msgId: string, elemId: string, videoCodecFormat: number, VideoRequestWay: number): Promise<unknown>;

    //exParams (RMReqExParams)
    // this.downSourceType = i2;
    // this.triggerType = i3;
    //peer, msgId, elemId, videoCodecFormat, exParams
    // 1 0 频道在用
    // 1 1
    // 0 2

    // public static final int KCOMMONREDENVELOPEMSGTYPEINMSGBOX = 1007;
    // public static final int KDOWNSOURCETYPEAIOINNER = 1;
    // public static final int KDOWNSOURCETYPEBIGSCREEN = 2;
    // public static final int KDOWNSOURCETYPEHISTORY = 3;
    // public static final int KDOWNSOURCETYPEUNKNOWN = 0;

    // public static final int KTRIGGERTYPEAUTO = 1;
    // public static final int KTRIGGERTYPEMANUAL = 0;

    getVideoPlayUrlV2(peer: Peer, msgId: string, elemId: string, videoCodecFormat: number, exParams: { downSourceType: number, triggerType: number }): Promise<GeneralCallResult & {
        urlResult: {
            v4IpUrl: [],
            v6IpUrl: [],
            domainUrl: Array<{
                url: string,
                isHttps: boolean,
                httpsDomain: string
            }>,
            videoCodecFormat: number
        }
    }>;

    getRichMediaFileDir(arg1: unknown, arg2: unknown, arg3: unknown): unknown;

    // this.senderUid = "";
    // this.peerUid = "";
    // this.guildId = "";
    // this.elem = new MsgElement();
    // this.downloadType = i2;
    // this.thumbSize = i3;
    // this.msgId = j2;
    // this.msgRandom = j3;
    // this.msgSeq = j4;
    // this.msgTime = j5;
    // this.chatType = i4;
    // this.senderUid = str;
    // this.peerUid = str2;
    // this.guildId = str3;
    // this.elem = msgElement;
    // this.useHttps = num;

    getVideoPlayUrlInVisit(arg: unknown): unknown;

    isFileExpired(arg: unknown): unknown;

    deleteGroupFolder(GroupCode: string, FolderId: string): Promise<GeneralCallResult & { groupFileCommonResult: { retCode: number, retMsg: string, clientWording: string } }>;

    //参数与getVideoPlayUrlInVisit一样
    downloadRichMediaInVisit(arg: unknown): unknown;

    downloadFileForModelId(peer: Peer, arg: unknown[], arg3: string): unknown;
    //第三个参数 Array<Type>
    // this.fileId = "";
    // this.fileName = "";
    // this.fileId = str;
    // this.fileName = str2;
    // this.fileSize = j2;
    // this.fileModelId = j3;

    downloadFileForFileUuid(peer: Peer, arg1: string, arg3: unknown[]): unknown;

    downloadFileByUrlListtransgroupfile(arg1: unknown, arg2: unknown): unknown;

    downloadFileForFileInfotransgroupfile(arg1: unknown, arg2: unknown): unknown;

    createGroupFolder(GroupCode: string, FolderName: string): Promise<GeneralCallResult & { resultWithGroupItem: { result: any, groupItem: Array<any> } }>

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
            retCode: number
            retMsg: string
            clientWording: string
            totalSpace: number
            usedSpace: number
            allUpload: boolean
        }
    }>;

    getGroupFileInfotransgroupfile(arg1: unknown, arg2: unknown): unknown;

    getGroupFileListtransgroupfile(arg1: unknown, arg2: unknown): unknown;

    getGroupTransferListtransgroupfile(arg1: unknown, arg2: unknown): unknown;

    renameGroupFile(arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown, arg5: unknown): unknown;

    moveGroupFile(arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown, arg5: unknown): unknown;

    transGroupFile(arg1: unknown, arg2: unknown): unknown;
    searchGroupFile(
        keywords: Array<string>,
        param: {
            groupIds: Array<string>,
            fileType: number,
            context: string,
            count: number,
            sortType: number,
            groupNames: Array<string>
        }): Promise<unknown>;
    searchGroupFileByWord(arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown, arg5: unknown): unknown;

    deleteGroupFile(GroupCode: string, params: Array<number>, Files: Array<string>): Promise<GeneralCallResult & {
        transGroupFileResult: {
            result: any
            successFileIdList: Array<any>
            failFileIdList: Array<any>
        }
    }>;

    translateEnWordToZn(words: string[]): Promise<GeneralCallResult & { words: string[] }>;

    getScreenOCR(path: string): Promise<unknown>;

    batchGetGroupFileCount(Gids: Array<string>): Promise<GeneralCallResult & { groupCodes: Array<string>, groupFileCounts: Array<number> }>;

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