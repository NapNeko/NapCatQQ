import { encode } from 'silk-wasm';

export interface EncodeArgs {
    input: ArrayBufferView | ArrayBuffer
    sampleRate: number
}
export default async ({ input, sampleRate }: EncodeArgs) => {
    return await encode(input, sampleRate);
};
