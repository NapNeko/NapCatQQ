export interface NodeIKernelSettingService {
  addKernelSettingListener (listener: unknown): number;

  removeKernelSettingListener (listenerId: number): void;

  getSettingForBuffer (key: unknown): unknown;

  getSettingForNum (key: unknown): unknown;

  getSettingForStr (key: unknown): unknown;

  setSettingForBuffer (arg: unknown): unknown;

  setSettingForNum (arg: unknown): unknown;

  setSettingForStr (arg: unknown): unknown;

  setAutoLoginSwitch (enabled: boolean): unknown;

  setNeedConfirmSwitch (enabled: boolean): unknown;

  setPrivacySetting (arg: unknown): unknown;

  setSelfStartSwitch (enabled: boolean): unknown;

  modifyAccount (arg: unknown): unknown;

  verifyNewAccount (arg: unknown): unknown;

  openUrlWithQQBrowser (url: string): unknown;

  openUrlInIM (url: string): unknown;

  clearCache (arg: unknown): unknown;

  destroyAccount (): unknown;

  isQQBrowserInstall (): boolean;

  getSelfStartSwitch (): unknown;

  getAutoLoginSwitch (): unknown;

  getNeedConfirmSwitch (): unknown;

  getPrivacySetting (): unknown;

  scanCache (): unknown;

  getQQBrowserSwitchFromQldQQ (): unknown;

  isNull (): boolean;
}
