export interface NodeIKernelWiFiPhotoClientService {
  addKernelWiFiPhotoClientListener (listener: unknown): number;

  removeKernelWiFiPhotoClientListener (listenerId: number): void;

  cancelGetPhoto (arg1: unknown, arg2: unknown): unknown;

  cancelGetPhotoThumbBatch (arg: unknown): unknown;

  cancelRequest (arg: unknown): unknown;

  connectToHostForTest (arg: unknown): unknown;

  deletePhotoBatch (arg: unknown): unknown;

  disconnect (arg: unknown): unknown;

  getAlbumFileSavePath (arg: unknown): unknown;

  getAllPhotoSimpleInfo (arg: unknown): unknown;

  getPhotoAndSaveAs (arg1: string, arg2: string, arg3: string): unknown;

  getPhotoBatch (arg1: unknown, arg2: unknown): unknown;

  getPhotoInfoBatch (arg1: unknown, arg2: unknown): unknown;

  getPhotoSimpleInfoForFirstView (arg1: string, arg2: number): unknown;

  getPhotoThumbBatchWithConfig (arg1: unknown, arg2: unknown): unknown;

  getWiFiPhotoDownFileInfos (arg1: string, arg2: Array<unknown>[]): unknown;

  resumeUncompleteDownloadRecords (arg: unknown): unknown;

  isNull (): boolean;
}
