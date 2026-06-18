import { GeneralCallResult } from './common';

export interface NodeIKernelNodeMiscService {
  writeVersionToRegistry (version: string): void;

  getMiniAppPath (): unknown;

  setMiniAppVersion (version: string): unknown;

  wantWinScreenOCR (imagepath: string): Promise<GeneralCallResult>;

  SendMiniAppMsg (arg1: string, arg2: string, arg3: string): unknown;

  startNewMiniApp (appfile: string, params: string): unknown;

  getQimei36WithNewSdk (): Promise<string>;

  adaptMiniAppShareInfo (arg: unknown): unknown;

  addBind (arg1: unknown, arg2: unknown): unknown;

  changeSendKey (arg: unknown): unknown;

  checkIfHaveAvailableSidecarDevice (arg: unknown): unknown;

  clearQzoneUnreadCount (arg: unknown): unknown;

  clearQzoneUnreadCountWithRedDot (arg: unknown): unknown;

  closeWXMiniApp (arg: unknown): unknown;

  delBind (arg: unknown): unknown;

  deleteShareFile (arg: unknown): unknown;

  dispatchWmpfEvent (arg: unknown): unknown;

  doAction (arg1: unknown, arg2: unknown): unknown;

  doPostAction (arg1: unknown, arg2: unknown): unknown;

  downloadMiniApp (arg: unknown): unknown;

  downloadMiniGame (arg: unknown): unknown;

  encodeAES (arg1: unknown, arg2: unknown): unknown;

  flashWindowInTaskbar (arg1: unknown, arg2: unknown): unknown;

  getAppLaunchInfo (arg: unknown): unknown;

  getCurWindowInfo (arg: unknown): unknown;

  getCurWindowInfoExceptList (arg: unknown): unknown;

  getMiniGameV2EngineConfig (arg: unknown): unknown;

  getMyAppList (arg: unknown): unknown;

  getOpenAuth (arg1: unknown, arg2: unknown): unknown;

  getQQlevelInfo (arg: unknown): unknown;

  getQzoneUnreadCount (arg: unknown): unknown;

  installApp (arg1: unknown, arg2: unknown): unknown;

  isAppInstalled (arg: unknown): unknown;

  isOldQQRunning (arg: unknown): unknown;

  judgeTimingRequest (arg: unknown): unknown;

  listenWindowEvents (arg: unknown): unknown;

  loginWXMiniApp (arg: unknown): unknown;

  openFileAndDirSelectDlg (arg: unknown): unknown;

  prefetch (arg: unknown): unknown;

  qqConnectBatchShare (arg1: unknown, arg2: unknown): unknown;

  qqConnectShare (arg: unknown): unknown;

  qqConnectShareCheck (arg: unknown): unknown;

  registerSchemes (arg: unknown): unknown;

  registerScreenCaptureShortcutWithKeycode (arg: unknown): unknown;

  registerScreenRecordShortcutWithKeycode (arg: unknown): unknown;

  removeQuarantineAttribute (arg: unknown): unknown;

  reportExecuteRequest (arg: unknown): unknown;

  scanQBar (arg: unknown): unknown;

  sendMessageResponseToWX (arg1: unknown, arg2: unknown): unknown;

  sendRequestToApiGateway (arg: unknown): unknown;

  sendWXCustomMenuClickedAction (arg1: unknown, arg2: unknown): unknown;

  setBackgroudWindowLevel (arg1: unknown, arg2: unknown): unknown;

  setMiniGameVersion (arg: unknown): unknown;

  setVulkanEnable (arg: unknown): unknown;

  setWindowLevelNT (arg1: unknown, arg2: unknown): unknown;

  setWindowsMenuInstallStatus (arg: unknown): unknown;

  setWXCustomMenuConfig (arg1: unknown, arg2: unknown): unknown;

  startNewApp (arg: unknown): unknown;

  startScreenCapture (arg1: unknown, arg2: unknown): unknown;

  stopFlashWindow (arg: unknown): unknown;

  unlistenWindowEvents (arg: unknown): unknown;

  unregisterHotkey (arg: unknown): unknown;

  writeBitmapToClipboard (arg: unknown): unknown;

  writeClipboard (arg1: unknown, arg2: unknown): unknown;
}
