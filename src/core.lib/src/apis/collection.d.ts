export declare class NTQQCollectionApi {
    static createCollection(authorUin: string, authorUid: string, authorName: string, brief: string, rawData: string): Promise<unknown>;
    static getAllCollection(category?: number, count?: number): Promise<import("..").GeneralCallResult & {
        collectionSearchList: {
            collectionItemList: {
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
            }[];
            hasMore: boolean;
            bottomTimeStamp: string;
        };
    }>;
}
