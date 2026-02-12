import { GeneralCallResult } from './common';
import {
  SendStatus,
  StartFlashTaskRequests,
  createFlashTransferResult,
  FlashBaseRequest,
  FlashFileSetInfo,
  FileListInfoRequests,
  FileListResponse,
  DownloadStatusInfo,
  SendTargetRequests,
  FlashOneFileInfo,
  DownloadSceneType,
} from '../data/flash';

export interface NodeIKernelFlashTransferService {
  /**
   * 开始闪传服务  并上传文件/文件夹（可以多选，非常好用）
   * @param timestamp
   * @param fileInfo
   */
  createFlashTransferUploadTask (timestamp: number, fileInfo: StartFlashTaskRequests): Promise<GeneralCallResult & {
    createFlashTransferResult: createFlashTransferResult;
    seq: number;
  }>; // 2 arg 重点 // 自动上传

  createMergeShareTask (arg1: unknown, arg2: unknown): unknown; // 2 arg

  updateFlashTransfer (arg1: unknown, arg2: unknown): unknown; // 2 arg

  getFileSetList (arg: unknown): unknown; // 1 arg

  getFileSetListCount (arg: unknown): unknown; // 1 arg

  /**
   * 获取file set 的信息
   * @param fileSetIdDict
   */
  getFileSet (fileSetIdDict: FlashBaseRequest): Promise<GeneralCallResult & {
    seq: number;
    isCache: boolean;
    fileSet: FlashFileSetInfo;
  }>; // 1 arg

  /**
   * 获取file set 里面的文件信息（文件夹结构）
   * @param requestArgs
   */
  getFileList (requestArgs: FileListInfoRequests): Promise<{
    rsp: FileListResponse;
  }>; // 1 arg 这个方法QQ有bug？？？   并没有，是我参数有问题

  getDownloadedFileCount (arg: unknown): unknown; // 1 arg

  getLocalFileList (arg1: number, arg2: string, arg3: Array<unknown>[]): unknown; // 3 arg

  batchRemoveUserFileSetHistory (arg: unknown): unknown; // 1 arg

  /**
   * 获取分享链接
   * @param fileSetId
   */
  getShareLinkReq (fileSetId: string): Promise<GeneralCallResult & {
    shareLink: string;
    expireTimestamp: string;
  }>;

  /**
   * 由分享链接到fileSetId
   * @param shareCode
   */
  getFileSetIdByCode (shareCode: string): Promise<GeneralCallResult & {
    fileSetId: string;
  }>; // 1 arg code == share code

  batchRemoveFile (arg: unknown): unknown; // 1 arg

  checkUploadPathValid (arg: unknown): unknown; // 1 arg

  cleanFailedFiles (arg1: number, arg2: Array<unknown>[]): unknown; // 2 arg

  /**
   * 暂停所有的任务
   */
  resumeAllUnfinishedTasks (): unknown; // 0 arg !!

  addFileSetUploadListener (listener: unknown): unknown; // 1 arg

  removeFileSetUploadListener (listenerId: unknown): unknown; // 1 arg

  /**
   * 开始上传任务  适用于已暂停的
   * @param fileSetId
   */
  startFileSetUpload (fileSetId: unknown): void; // 1 arg  并不是新建任务，应该是暂停后的启动

  /**
   * 结束，无法再次启动
   * @param fileSetId
   */
  stopFileSetUpload (fileSetId: string): void; // 1 arg  stop 后start无效

  /**
   * 暂停上传
   * @param fileSetId
   */
  pauseFileSetUpload (fileSetId: string): void; // 1 arg  暂停上传

  /**
   * 继续上传
   * @param args
   */
  resumeFileSetUpload (fileSetId: unknown): unknown; // 1 arg  继续

  pauseFileUpload (arg: unknown): unknown; // 1 arg

  resumeFileUpload (arg: unknown): unknown; // 1 arg

  stopFileUpload (arg: unknown): unknown; // 1 arg

  asyncGetThumbnailPath (arg1: unknown, arg2: unknown): unknown; // 2 arg

  setDownLoadDefaultFileDir (dir: unknown): unknown; // 1 arg

  setFileSetDownloadDir (arg1: unknown, arg2: unknown): unknown; // 2 arg

  getFileSetDownloadDir (arg: unknown): unknown; // 1 arg

  setFlashTransferDir (arg1: unknown, arg2: unknown): unknown; // 2 arg

  addFileSetDownloadListener (listener: unknown): unknown; // 1 arg

  removeFileSetDownloadListener (listenerId: unknown): unknown; // 1 arg

  /**
   * 开始下载file set的函数  同开始上传
   * @param fileSetId
   * @param downloadSceneType  下载类型 //因为没有peer，其实可以硬编码为1 （好友私聊）
   * @param arg // 默认为false
   */
  startFileSetDownload (fileSetId: string, downloadSceneType: DownloadSceneType, downloadOptionParams: { isIncludeCompressInnerFiles: boolean; }): Promise<GeneralCallResult & {
    extraInfo: 0;
  }>; // 3 arg

  stopFileSetDownload (fileSetId: string, downloadOptionParams: { isIncludeCompressInnerFiles: boolean; }): Promise<GeneralCallResult & {
    extraInfo: 0;
  }>; // 2 arg  结束不可重启！！

  pauseFileSetDownload (fileSetId: string, downloadOptionParams: { isIncludeCompressInnerFiles: boolean; }): Promise<GeneralCallResult & {
    extraInfo: 0;
  }>; // 2 arg

  resumeFileSetDownload (fileSetId: string, downloadOptionParams: { isIncludeCompressInnerFiles: boolean; }): Promise<GeneralCallResult & {
    extraInfo: 0;
  }>; // 2 arg

  startFileListDownLoad (arg1: string, arg2: number, arg3: Array<unknown>[], arg4: unknown): unknown; // 4 arg // 大概率是选择set里面的部分文件进行下载，没必要，不想写

  pauseFileListDownLoad (arg1: unknown, arg2: unknown): unknown; // 2 arg

  resumeFileListDownLoad (arg1: unknown, arg2: unknown): unknown; // 2 arg

  stopFileListDownLoad (arg1: unknown, arg2: unknown): unknown; // 2 arg

  startThumbnailListDownload (fileSetId: string): Promise<GeneralCallResult>; // 1 arg // 缩略图下载

  stopThumbnailListDownload (fileSetId: string): Promise<GeneralCallResult>; // 1 arg

  asyncRequestDownLoadStatus (fileSetId: string): Promise<DownloadStatusInfo>; // 1 arg

  startFileTransferUrl (fileInfo: FlashOneFileInfo): Promise<{
    ret: number,
    url: string,
    expireTimestampSeconds: string;
  }>; // 1 arg

  startFileListDownLoadBySessionId (arg1: unknown, arg2: unknown): unknown; // 2 arg

  addFileSetSimpleStatusListener (arg1: unknown, arg2: unknown): unknown; // 2 arg

  addFileSetSimpleStatusMonitoring (arg1: unknown, arg2: unknown): unknown; // 2 arg

  removeFileSetSimpleStatusMonitoring (arg1: unknown, arg2: unknown): unknown; // 2 arg

  removeFileSetSimpleStatusListener (arg: unknown): unknown; // 1 arg

  addDesktopFileSetSimpleStatusListener (arg: unknown): unknown; // 1 arg

  addDesktopFileSetSimpleStatusMonitoring (arg: unknown): unknown; // 1 arg

  removeDesktopFileSetSimpleStatusMonitoring (arg: unknown): unknown; // 1 arg

  removeDesktopFileSetSimpleStatusListener (arg: unknown): unknown; // 1 arg

  addFileSetSimpleUploadInfoListener (arg: unknown): unknown; // 1 arg

  addFileSetSimpleUploadInfoMonitoring (arg: unknown): unknown; // 1 arg

  removeFileSetSimpleUploadInfoMonitoring (arg: unknown): unknown; // 1 arg

  removeFileSetSimpleUploadInfoListener (arg: unknown): unknown; // 1 arg
  /**
   * 发送闪传消息
   * @param sendArgs
   */
  sendFlashTransferMsg (sendArgs: SendTargetRequests): Promise<{
    errCode: number,
    errMsg: string,
    rsp: {
      sendStatus: SendStatus[];
    };
  }>; // 1 arg  估计是file set id

  addFlashTransferTaskInfoListener (listener: unknown): unknown; // 1 arg

  removeFlashTransferTaskInfoListener (listenerId: unknown): unknown; // 1 arg

  retrieveLocalLastFailedSetTasksInfo (): unknown; // 0 arg

  getFailedFileList (fileSetId: string): Promise<{
    rsp: {
      seq: number;
      result: number;
      errMs: string;
      fileSetId: string;
      fileList: [];
    };
  }>; // 1 arg

  getLocalFileListByStatuses (arg: unknown): unknown; // 1 arg

  addTransferStateListener (listener: unknown): unknown; // 1 arg

  removeTransferStateListener (listenerId: unknown): unknown; // 1 arg

  getFileSetFirstClusteringList (arg1: number, arg2: string, arg3: number): unknown; // 3 arg

  getFileSetClusteringList (arg: unknown): unknown; // 1 arg

  addFileSetClusteringListListener (listener: unknown): unknown; // 1 arg

  removeFileSetClusteringListListener (listenerId: unknown): unknown; // 1 arg

  getFileSetClusteringDetail (arg: unknown): unknown; // 1 arg

  doAIOFlashTransferBubbleActionWithStatus (arg1: string, arg2: number, arg3: number, arg4: unknown): unknown; // 4 arg

  getFilesTransferProgress (arg: unknown): unknown; // 1 arg

  pollFilesTransferProgress (arg: unknown): unknown; // 1 arg

  cancelPollFilesTransferProgress (arg: unknown): unknown; // 1 arg

  checkDownloadStatusBeforeLocalFileOper (arg1: number, arg2: string, arg3: string): unknown; // 3 arg

  getCompressedFileFolder (arg: unknown): unknown; // 1 arg

  addFolderListener (listener: unknown): unknown; // 1 arg

  removeFolderListener (listenerId: unknown): unknown;

  addCompressedFileListener (listener: unknown): unknown;

  removeCompressedFileListener (listenerId: unknown): unknown;

  getFileCategoryList (arg: unknown): unknown;

  addDeviceStatusListener (listener: unknown): unknown;

  removeDeviceStatusListener (listenerId: unknown): unknown;

  checkDeviceStatus (arg: unknown): unknown;

  pauseAllTasks (arg1: number, arg2: number): unknown; // 2 arg

  resumePausedTasksAfterDeviceStatus (arg: unknown): unknown;

  onSystemGoingToSleep (arg: unknown): unknown;

  onSystemWokeUp (arg: unknown): unknown;

  getFileMetas (arg: unknown): unknown;

  addDownloadCntStatisticsListener (listener: unknown): unknown;

  removeDownloadCntStatisticsListener (listenerId: unknown): unknown;

  detectPrivacyInfoInPaths (arg: unknown): unknown;

  getFileThumbnailUrl (arg: unknown): unknown;

  handleDownloadFinishAfterSaveToAlbum (arg: unknown): unknown;

  checkBatchFilesDownloadStatus (arg: unknown): unknown;

  onCheckAlbumStorageStatusResult (arg: unknown): unknown;

  addFileAlbumStorageListener (listener: unknown): unknown;

  removeFileAlbumStorageListener (listenerId: unknown): unknown;

  refreshFolderStatus (arg: unknown): unknown;
}
