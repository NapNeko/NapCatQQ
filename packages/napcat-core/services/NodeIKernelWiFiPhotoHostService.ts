export interface NodeIKernelWiFiPhotoHostService {
  addKernelWiFiPhotoHostListener (listener: unknown): number;

  removeKernelWiFiPhotoHostListener (listenerId: number): void;

  acceptRequest (arg1: number, arg2: unknown): unknown;

  disconnect (arg: unknown): unknown;

  rejectRequest (arg1: number, arg2: number): unknown;

  setAlbumAccessDelegate (arg: unknown): unknown;

  isNull (): boolean;
}
