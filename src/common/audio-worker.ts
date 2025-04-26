import { encode } from 'silk-wasm';
import { parentPort } from 'worker_threads';

export interface EncodeArgs {
    input: ArrayBufferView | ArrayBuffer
    sampleRate: number
}
export function recvTask<T>(cb: (taskData: T) => Promise<unknown>) {
    parentPort?.on('message', async (taskData: T) => {
        try {
            let ret = await cb(taskData);
            parentPort?.postMessage(ret);
        } catch (error: unknown) {
            parentPort?.postMessage({ error: (error as Error).message });
        }
    });
}
recvTask<EncodeArgs>(async ({ input, sampleRate }) => {
    return await encode(input, sampleRate);
});