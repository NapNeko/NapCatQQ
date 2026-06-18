import { NodeIO3MiscListener } from '@/napcat-core/listeners/NodeIO3MiscListener';

export interface NodeIO3MiscService {
  get (): NodeIO3MiscService;

  addO3MiscListener (listener: NodeIO3MiscListener): number;

  removeO3MiscListener (listenerId: number): void;

  passthroughO3Data (arg1: unknown, arg2: unknown): unknown;

  reportAmgomWeather (arg1: unknown, arg2: unknown, arg3: unknown): unknown;

  setAmgomDataPiece (appid: string, dataPiece: Uint8Array): void;
}
