import { GeneralCallResult } from "./common";
export interface NodeIKernelCollectionService {
    addKernelCollectionListener(...args: any[]): unknown;
    removeKernelCollectionListener(...args: any[]): unknown;
    getCollectionItemList(param: {
        category: number;
        groupId: number;
        forceSync: boolean;
        forceFromDb: boolean;
        timeStamp: string;
        count: number;
        searchDown: boolean;
    }): Promise<GeneralCallResult & {
        collectionSearchList: {
            collectionItemList: Array<{
                cid: string;
                type: number;
                status: number;
                author: {
                    type: number;
                    numId: string;
                    strId: string;
                    groupId: string;
                    groupName: string;
                    uid: string;
                };
                bid: number;
                category: number;
                createTime: string;
                collectTime: string;
                modifyTime: string;
                sequence: string;
                shareUrl: string;
                customGroupId: number;
                securityBeat: boolean;
                summary: {
                    textSummary: unknown;
                    linkSummary: unknown;
                    gallerySummary: unknown;
                    audioSummary: unknown;
                    videoSummary: unknown;
                    fileSummary: unknown;
                    locationSummary: unknown;
                    richMediaSummary: unknown;
                };
            }>;
            hasMore: boolean;
            bottomTimeStamp: string;
        };
    }>;
    getCollectionContent(...args: any[]): unknown;
    getCollectionCustomGroupList(...args: any[]): unknown;
    getCollectionUserInfo(...args: any[]): unknown;
    searchCollectionItemList(...args: any[]): unknown;
    addMsgToCollection(...args: any[]): unknown;
    collectionArkShare(...args: any[]): unknown;
    collectionFileForward(...args: any[]): unknown;
    downloadCollectionFile(...args: any[]): unknown;
    downloadCollectionFileThumbPic(...args: any[]): unknown;
    downloadCollectionPic(...args: any[]): unknown;
    cancelDownloadCollectionFile(...args: any[]): unknown;
    deleteCollectionItemList(...args: any[]): unknown;
    editCollectionItem(...args: any[]): unknown;
    getEditPicInfoByPath(...args: any[]): unknown;
    collectionFastUpload(...args: any[]): unknown;
    editCollectionItemAfterFastUpload(...args: any[]): unknown;
    createNewCollectionItem(...args: any[]): unknown;
}
