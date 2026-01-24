export interface FlashBaseRequest {
  fileSetId: string;
}

export interface UploaderInfo {
  uin: string,
  nickname: string,
  uid: string,
  sendEntrance: string, // ""
}

export interface thumbnailInfo {
  id: string,
  url: {
    spec: number,
    uri: string,
  }[],
  localCachePath: string,
}

export interface SendTarget {
  destType: number; // 1私聊
  destUin?: string,
  destUid: string,
}

export interface SendTargetRequests {
  fileSetId: string;
  targets: SendTarget[];
}

export interface DownloadStatusInfo {
  result: number; // 0
  fileSetId: string;
  status: number;
  info: {
    curDownLoadFailFileNum: number,
    curDownLoadedPauseFileNum: number,
    curDownLoadedFileNum: number,
    curRealDownLoadedFileNum: number,
    curDownloadingFileNum: number,
    totalDownLoadedFileNum: number,
    curDownLoadedBytes: string, // "0"
    totalDownLoadedBytes: string,
    curSpeedBps: number,
    avgSpeedBps: number,
    maxSpeedBps: number,
    remainDownLoadSeconds: number,
    failFileIdList: [],
    allFileIdList: [],
    hasNormalFileDownloading: boolean,
    onlyCompressInnerFileDownloading: boolean,
    isAllFileAlreadyDownloaded: boolean,
    saveFileSetDir: string,
    allWaitingStatusTask: boolean,
    downloadSceneType: number,
    retryCount: number,
    statisticInfo: {
      downloadTaskId: string,
      downloadFilesetName: string,
      downloadFileTypeDistribution: string,
      downloadFileSizeDistribution: string;
    },
    albumStorageFailImageNum: number,
    albumStorageFailVideoNum: number,
    albumStorageFailFileIdList: [],
    albumStorageSucImageNum: number,
    albumStorageSucVideoNum: number,
    albumStorageSucFileIdList: [],
    albumStorageFileNum: number;
  };
}

export interface physicalInfo {
  id: string,
  url: string,
  status: number, // 2 已下载
  processing: string,
  localPath: string,
  width: 0,
  height: 0,
  time: number,
}

export interface downloadInfo {
  status: number,
  curDownLoadBytes: string,
  totalFileBytes: string,
  errorCode: number,
}

export interface uploadInfo {
  uploadedBytes: string,
  errorCode: number,
  svrRrrCode: number,
  errMsg: string,
  isNeedDelDeviceInfo: boolean,
  thumbnailUploadState: number;
  isSecondHit: boolean,
  hasModifiedErr: boolean,
}

export interface folderUploadInfo {
  totalUploadedFileSize: string;
  successCount: number;
  failedCount: number;
}

export interface folderDownloadInfo {
  totalDownloadedFileSize: string;
  totalFileSize: string;
  totalDownloadFileCount: number;
  successCount: number;
  failedCount: number;
  pausedCount: number;
  cancelCount: number;
  downloadingCount: number;
  partialDownloadCount: number;
  curLevelDownloadedFileCount: number;
  curLevelUnDownloadedFileCount: number;
}

export interface compressFileFolderInfo {
  downloadStatus: number;
  saveFileDirPath: string;
  totalFileCount: string;
  totalFileSize: string;
}

export interface albumStorgeInfo {
  status: number;
  localIdentifier: string;
  errorCode: number;
  timeCost: number;
}

export interface FlashOneFileInfo {
  fileSetId: string;
  cliFileId: string; // client?? 或许可以换取url
  compressedFileFolderId: string;
  archiveIndex: 0;
  indexPath: string;
  isDir: boolean; // 文件或者文件夹！！
  parentId: string;
  depth: number; // 1
  cliFileIndex: number;
  fileType: number; // 枚举!!  已完成枚举！！
  name: string;
  namePinyin: string;
  isCover: boolean;
  isCoverOriginal: boolean;
  fileSize: string;
  fileCount: number;
  thumbnail: thumbnailInfo;
  physical: physicalInfo;
  srvFileId: string;  // service?? 服务器上面的id吗？
  srvParentFileId: string;
  svrLastUpdateTimestamp: string;
  downloadInfo: downloadInfo;
  saveFilePath: string;
  search_relative_path: string;
  disk_relative_path: string;
  uploadInfo: uploadInfo;
  status: number;
  uploadStatus: number; // 3已上传成功
  downloadStatus: number; // 0未下载
  folderUploadInfo: folderUploadInfo;
  folderDownloadInfo: folderDownloadInfo;
  sha1: string;
  bookmark: string;
  compressFileFolderInfo: compressFileFolderInfo;
  uploadPauseReason: string;
  downloadPauseReason: string;
  filePhysicalSize: string;
  thumbnail_sha1: string | null;
  thumbnail_size: string | null;
  needAlbumStorage: boolean;
  albumStorageInfo: albumStorgeInfo;
}

export interface fileListsInfo {
  parentId: string,
  depth: number, // 1
  fileList: FlashOneFileInfo[],
  paginationInfo: {};
  isEnd: boolean,
  isCache: boolean,
}

export interface FileListResponse {
  seq: number,
  result: number,
  errMs: string,
  fileLists: fileListsInfo[],
}

export interface createFlashTransferResult {
  fileSetId: string,
  shareLink: string,
  expireTime: string,
  expireLeftTime: string,
}
export enum UploadSceneType {
  KUPLOADSCENEUNKNOWN,
  KUPLOADSCENEFLOATWINDOWRIGHTCLICKMENU,
  KUPLOADSCENEFLOATWINDOWDRAG,
  KUPLOADSCENEFLOATWINDOWFILESELECTOR,
  KUPLOADSCENEFLOATWINDOWSHORTCUTKEYCTRLCV,
  KUPLOADSCENEH5LAUNCHCLIENTRIGHTCLICKMENU,
  KUPLOADSCENEH5LAUNCHCLIENTDRAG,
  KUPLOADSCENEH5LAUNCHCLIENTFILESELECTOR,
  KUPLOADSCENEH5LAUNCHCLIENTSHORTCUTKEYCTRLCV,
  KUPLOADSCENEAIODRAG,
  KUPLOADSCENEAIOFILESELECTOR,
  KUPLOADSCENEAIOSHORTCUTKEYCTRLCV
}
export interface StartFlashTaskRequests {
  screen: number; // 1 PC-QQ
  name?: string;
  uploaders: UploaderInfo[];
  permission?: {};
  coverPath?: string;
  paths: string[];   // 文件的绝对路径，可以是文件夹
  excludePaths?: string[];
  expireLeftTime?: number, // 0
  isNeedDelDeviceInfo: boolean,
  isNeedDelLocation: boolean,
  coverOriginalInfos?: {
    path: string,
    thumbnailPath: string,
  }[],
  uploadSceneType: UploadSceneType, // 不知道怎么枚举 先硬编码吧 (PC QQ 10)
  detectPrivacyInfoResult: {
    exists: boolean,
    allDetectResults: {};
  };
}

export interface FileListInfoRequests {
  seq: number,  // 0
  fileSetId: string,
  isUseCache: boolean,
  sceneType: number, // 1
  reqInfos: {
    count: number, // 18 ??  硬编码吧  不懂
    paginationInfo: {},
    parentId: string,
    reqIndexPath: string,
    reqDepth: number, // 1
    filterCondition: {
      fileCategory: number,
      filterType: number,
    },   // 0
    sortConditions: {
      sortField: number,
      sortOrder: number,
    }[],
    isNeedPhysicalInfoReady: boolean;
  }[];
}

export interface FlashFileSetInfo {
  fileSetId: string,
  name: string,
  namePinyin: string,
  totalFileCount: number,
  totalFileSize: number,
  permission: {},
  shareInfo: {
    shareLink: string,
    extractionCode: string,
  },
  cover: {
    id: string,
    urls: [
      {
        spec: number, // 2
        url: string;
      }
    ],
    localCachePath: string;
  },
  uploaders: [
    {
      uin: string,
      nickname: string,
      uid: string,
      sendEntrance: string;
    }
  ],
  expireLeftTime: number,
  aiClusteringStatus: {
    firstClusteringList: [],
    shouldPull: boolean;
  },
  createTime: number,
  expireTime: number,
  firstLevelItemCount: 1,
  svrLastUpdateTimestamp: 0,
  taskId: string, // 同 fileSetId
  uploadInfo: {
    totalUploadedFileSize: number,
    successCount: number,
    failedCount: number;
  },
  downloadInfo: {
    totalDownloadedFileSize: 0,
    totalFileSize: 0,
    totalDownloadFileCount: 0,
    successCount: 0,
    failedCount: 0,
    pausedCount: 0,
    cancelCount: 0,
    status: 0,
    curLevelDownloadedFileCount: number,
    curLevelUnDownloadedFileCount: 0;
  },
  transferType: number,
  isLocalCreate: true,
  status: number, //  todo 枚举全部状态
  uploadStatus: number, // todo 同上
  uploadPauseReason: 0,
  downloadStatus: 0,
  downloadPauseReason: 0,
  saveFileSetDir: string,
  uploadSceneType: UploadSceneType,
  downloadSceneType: 0, // 0 PC-QQ  103 web
  retryCount: number,
  isMergeShareUpload: 0,
  isRemoveDeviceInfo: boolean,
  isRemoveLocation: boolean;
}

export interface SendStatus {
  result: number,
  msg: string,
  target: {
    destType: number,
    destUid: string,
  };
}
