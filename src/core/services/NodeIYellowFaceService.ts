export interface NodeIYellowFaceService {
    download(resourceConfigJson: string, resourceDir: string, cacheDir: string, force: boolean): void;

    setHistory(fullMd5: string): void;
}
