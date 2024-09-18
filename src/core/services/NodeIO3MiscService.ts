export interface NodeIO3MiscService {
    addO3MiscListener(listeners: NodeIO3MiscService): number;

    setAmgomDataPiece(appid: string, dataPiece: Uint8Array): void;
}
