import { NodeIO3MiscListener } from '@/core/listeners/NodeIO3MiscListener';

export interface NodeIO3MiscService {
    get(): NodeIO3MiscService;

    addO3MiscListener(listeners: NodeIO3MiscListener): number;

    setAmgomDataPiece(appid: string, dataPiece: Uint8Array): void;

    reportAmgomWeather(type: string, uk2: string, arg: Array<string>): void;
}
