import { GeneralCallResult } from './common';

export interface NodeIKernelCollectionService {
    addKernelCollectionListener(...args: any[]): void;//needs 1 arguments

    removeKernelCollectionListener(listenerId: number): void;

    getCollectionItemList(param: {
        category: number,
        groupId: number,
        forceSync: boolean,
        forceFromDb: boolean,
        timeStamp: string,
        count: number,
        searchDown: boolean
    }): Promise<GeneralCallResult &
    {
        collectionSearchList: {
            collectionItemList: Array<
                {
                    cid: string,
                    type: number,
                    status: number,
                    author: {
                        type: number,
                        numId: string,
                        strId: string,
                        groupId: string,
                        groupName: string,
                        uid: string
                    },
                    bid: number,
                    category: number,
                    createTime: string,
                    collectTime: string,
                    modifyTime: string,
                    sequence: string,
                    shareUrl: string,
                    customGroupId: number,
                    securityBeat: boolean,
                    summary: {
                        textSummary: unknown,
                        linkSummary: unknown,
                        gallerySummary: unknown,
                        audioSummary: unknown,
                        videoSummary: unknown,
                        fileSummary: unknown,
                        locationSummary: unknown,
                        richMediaSummary: unknown,
                    }
                }>,
            hasMore: boolean,
            bottomTimeStamp: string
        }
    }
    >;

    getCollectionContent(...args: any[]): unknown;//needs 5 arguments

    getCollectionCustomGroupList(...args: any[]): unknown;//needs 0 arguments

    getCollectionUserInfo(...args: any[]): unknown;//needs 0 arguments

    searchCollectionItemList(...args: any[]): unknown;//needs 2 arguments

    addMsgToCollection(...args: any[]): unknown;//needs 2 arguments

    collectionArkShare(...args: any[]): unknown;//needs 1 arguments

    collectionFileForward(...args: any[]): unknown;//needs 3 arguments

    downloadCollectionFile(...args: any[]): unknown;//needs 4 arguments

    downloadCollectionFileThumbPic(...args: any[]): unknown;//needs 4 arguments

    downloadCollectionPic(...args: any[]): unknown;//needs 3 arguments

    cancelDownloadCollectionFile(...args: any[]): unknown;//needs 1 arguments

    deleteCollectionItemList(...args: any[]): unknown;//needs 1 arguments

    editCollectionItem(...args: any[]): unknown;//needs 2 arguments

    getEditPicInfoByPath(...args: any[]): unknown;//needs 1 arguments

    collectionFastUpload(...args: any[]): unknown;//needs 1 arguments

    editCollectionItemAfterFastUpload(...args: any[]): unknown;//needs 2 arguments

    createNewCollectionItem(...args: any[]): unknown;//needs 1 arguments
}
