export interface NodeIYellowFaceService {
  addListener (listener: unknown): number;

  removeListener (listenerId: number): void;

  download (resourceConfigJson: string, resourceDir: string, cacheDir: string, force: boolean): void;

  setHistory (fullMd5: string): void;

  update (arg: unknown): unknown;
}
