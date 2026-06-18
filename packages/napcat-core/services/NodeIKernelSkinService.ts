export interface NodeIKernelSkinService {
  addKernelSkinListener (listener: unknown): number;

  removeKernelSkinListener (listenerId: number): void;

  getRecommendAIOColor (arg1: unknown, arg2: unknown): unknown;

  getRecommendBubbleColor (arg1: unknown, arg2: unknown): unknown;

  getThemeInfoFromImage (arg: unknown): unknown;

  previewTheme (arg1: number, arg2: unknown, arg3: unknown): unknown;

  setTemplateCustomPrimaryColor (arg1: unknown, arg2: unknown): unknown;

  setThemeInfo (arg1: number, arg2: unknown, arg3: unknown): unknown;

  uploadImage (arg: unknown): unknown;

  isNull (): boolean;
}
