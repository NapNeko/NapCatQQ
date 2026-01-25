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

  createMergeShareTask (...args: unknown[]): unknown; // 2 arg

  updateFlashTransfer (...args: unknown[]): unknown; // 2 arg

  getFileSetList (...args: unknown[]): unknown; // 1 arg

  getFileSetListCount (...args: unknown[]): unknown; // 1 arg

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

  getDownloadedFileCount (...args: unknown[]): unknown; // 1 arg

  getLocalFileList (...args: unknown[]): unknown; // 3 arg

  batchRemoveUserFileSetHistory (...args: unknown[]): unknown; // 1 arg

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

  batchRemoveFile (...args: unknown[]): unknown; // 1 arg

  checkUploadPathValid (...args: unknown[]): unknown; // 1 arg

  cleanFailedFiles (...args: unknown[]): unknown; // 2 arg

  /**
   * 暂停所有的任务
   */
  resumeAllUnfinishedTasks (): unknown; // 0 arg !!

  addFileSetUploadListener (...args: unknown[]): unknown; // 1 arg

  removeFileSetUploadListener (...args: unknown[]): unknown; // 1 arg

  /**
   * 开始上传任务  适用于已暂停的
   * @param fileSetId
   */
  startFileSetUpload (fileSetId: string): void; // 1 arg  并不是新建任务，应该是暂停后的启动

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
  resumeFileSetUpload (...args: unknown[]): unknown; // 1 arg  继续

  pauseFileUpload (...args: unknown[]): unknown; // 1 arg

  resumeFileUpload (...args: unknown[]): unknown; // 1 arg

  stopFileUpload (...args: unknown[]): unknown; // 1 arg

  asyncGetThumbnailPath (...args: unknown[]): unknown; // 2 arg

  setDownLoadDefaultFileDir (...args: unknown[]): unknown; // 1 arg

  setFileSetDownloadDir (...args: unknown[]): unknown; // 2 arg

  getFileSetDownloadDir (...args: unknown[]): unknown; // 1 arg

  setFlashTransferDir (...args: unknown[]): unknown; // 2 arg

  addFileSetDownloadListener (...args: unknown[]): unknown; // 1 arg

  removeFileSetDownloadListener (...args: unknown[]): unknown; // 1 arg

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

  startFileListDownLoad (...args: unknown[]): unknown; // 4 arg // 大概率是选择set里面的部分文件进行下载，没必要，不想写

  pauseFileListDownLoad (...args: unknown[]): unknown; // 2 arg

  resumeFileListDownLoad (...args: unknown[]): unknown; // 2 arg

  stopFileListDownLoad (...args: unknown[]): unknown; // 2 arg

  startThumbnailListDownload (fileSetId: string): Promise<GeneralCallResult>; // 1 arg // 缩略图下载

  stopThumbnailListDownload (fileSetId: string): Promise<GeneralCallResult>; // 1 arg

  asyncRequestDownLoadStatus (fileSetId: string): Promise<DownloadStatusInfo>; // 1 arg

  startFileTransferUrl (fileInfo: FlashOneFileInfo): Promise<{
    ret: number,
    url: string,
    expireTimestampSeconds: string;
  }>; // 1 arg

  startFileListDownLoadBySessionId (...args: unknown[]): unknown; // 2 arg

  addFileSetSimpleStatusListener (...args: unknown[]): unknown; // 2 arg

  addFileSetSimpleStatusMonitoring (...args: unknown[]): unknown; // 2 arg

  removeFileSetSimpleStatusMonitoring (...args: unknown[]): unknown; // 2 arg

  removeFileSetSimpleStatusListener (...args: unknown[]): unknown; // 1 arg

  addDesktopFileSetSimpleStatusListener (...args: unknown[]): unknown; // 1 arg

  addDesktopFileSetSimpleStatusMonitoring (...args: unknown[]): unknown; // 1 arg

  removeDesktopFileSetSimpleStatusMonitoring (...args: unknown[]): unknown; // 1 arg

  removeDesktopFileSetSimpleStatusListener (...args: unknown[]): unknown; // 1 arg

  addFileSetSimpleUploadInfoListener (...args: unknown[]): unknown; // 1 arg

  addFileSetSimpleUploadInfoMonitoring (...args: unknown[]): unknown; // 1 arg

  removeFileSetSimpleUploadInfoMonitoring (...args: unknown[]): unknown; // 1 arg

  removeFileSetSimpleUploadInfoListener (...args: unknown[]): unknown; // 1 arg
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

  addFlashTransferTaskInfoListener (...args: unknown[]): unknown; // 1 arg

  removeFlashTransferTaskInfoListener (...args: unknown[]): unknown; // 1 arg

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

  getLocalFileListByStatuses (...args: unknown[]): unknown; // 1 arg

  addTransferStateListener (...args: unknown[]): unknown; // 1 arg

  removeTransferStateListener (...args: unknown[]): unknown; // 1 arg

  getFileSetFirstClusteringList (...args: unknown[]): unknown; // 3 arg

  getFileSetClusteringList (...args: unknown[]): unknown; // 1 arg

  addFileSetClusteringListListener (...args: unknown[]): unknown; // 1 arg

  removeFileSetClusteringListListener (...args: unknown[]): unknown; // 1 arg

  getFileSetClusteringDetail (...args: unknown[]): unknown; // 1 arg

  doAIOFlashTransferBubbleActionWithStatus (...args: unknown[]): unknown; // 4 arg

  getFilesTransferProgress (...args: unknown[]): unknown; // 1 arg

  pollFilesTransferProgress (...args: unknown[]): unknown; // 1 arg

  cancelPollFilesTransferProgress (...args: unknown[]): unknown; // 1 arg

  checkDownloadStatusBeforeLocalFileOper (...args: unknown[]): unknown; // 3 arg

  getCompressedFileFolder (...args: unknown[]): unknown; // 1 arg

  addFolderListener (...args: unknown[]): unknown; // 1 arg

  removeFolderListener (...args: unknown[]): unknown;

  addCompressedFileListener (...args: unknown[]): unknown;

  removeCompressedFileListener (...args: unknown[]): unknown;

  getFileCategoryList (...args: unknown[]): unknown;

  addDeviceStatusListener (...args: unknown[]): unknown;

  removeDeviceStatusListener (...args: unknown[]): unknown;

  checkDeviceStatus (...args: unknown[]): unknown;

  pauseAllTasks (...args: unknown[]): unknown; // 2 arg

  resumePausedTasksAfterDeviceStatus (...args: unknown[]): unknown;

  onSystemGoingToSleep (...args: unknown[]): unknown;

  onSystemWokeUp (...args: unknown[]): unknown;

  getFileMetas (...args: unknown[]): unknown;

  addDownloadCntStatisticsListener (...args: unknown[]): unknown;

  removeDownloadCntStatisticsListener (...args: unknown[]): unknown;

  detectPrivacyInfoInPaths (...args: unknown[]): unknown;

  getFileThumbnailUrl (...args: unknown[]): unknown;

  handleDownloadFinishAfterSaveToAlbum (...args: unknown[]): unknown;

  checkBatchFilesDownloadStatus (...args: unknown[]): unknown;

  onCheckAlbumStorageStatusResult (...args: unknown[]): unknown;

  addFileAlbumStorageListener (...args: unknown[]): unknown;

  removeFileAlbumStorageListener (...args: unknown[]): unknown;

  refreshFolderStatus (...args: unknown[]): unknown;
}
