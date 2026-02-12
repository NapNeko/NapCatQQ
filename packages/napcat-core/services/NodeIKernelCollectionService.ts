import { GeneralCallResult } from './common';

export interface NodeIKernelCollectionService {
  addKernelCollectionListener (listener: unknown): void;// needs 1 arguments

  removeKernelCollectionListener (listenerId: number): void;

  getCollectionItemList (param: {
    category: number,
    groupId: number,
    forceSync: boolean,
    forceFromDb: boolean,
    timeStamp: string,
    count: number,
    searchDown: boolean;
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
            uid: string;
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
          };
        }>,
      hasMore: boolean,
      bottomTimeStamp: string;
    };
  }
  >;

  getCollectionContent (arg1: string, arg2: number, arg3: string, arg4: string, arg5: boolean): unknown;// needs 5 arguments

  getCollectionCustomGroupList (): unknown;// needs 0 arguments

  getCollectionUserInfo (): unknown;// needs 0 arguments

  searchCollectionItemList (arg1: string, arg2: unknown): unknown;// needs 2 arguments

  addMsgToCollection (arg1: unknown, arg2: unknown): unknown;// needs 2 arguments

  collectionArkShare (arg: unknown): unknown;// needs 1 arguments

  collectionFileForward (arg1: number, arg2: string, arg3: unknown): unknown;// needs 3 arguments

  downloadCollectionFile (arg1: string, arg2: string, arg3: unknown, arg4: string): unknown;// needs 4 arguments

  downloadCollectionFileThumbPic (arg1: string, arg2: string, arg3: unknown, arg4: number): unknown;// needs 4 arguments

  downloadCollectionPic (arg1: string, arg2: string, arg3: unknown): unknown;// needs 3 arguments

  cancelDownloadCollectionFile (arg: unknown): unknown;// needs 1 arguments

  deleteCollectionItemList (arg: unknown): unknown;// needs 1 arguments

  editCollectionItem (arg1: unknown, arg2: unknown): unknown;// needs 2 arguments

  getEditPicInfoByPath (arg: unknown): unknown;// needs 1 arguments

  collectionFastUpload (arg: unknown): unknown;// needs 1 arguments

  editCollectionItemAfterFastUpload (arg1: unknown, arg2: unknown): unknown;// needs 2 arguments

  createNewCollectionItem (arg: unknown): unknown;// needs 1 arguments
}
