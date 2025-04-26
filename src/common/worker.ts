import { Worker } from 'worker_threads';

export async function runTask<T, R>(workerScript: string, taskData: T): Promise<R> {
    let worker = new Worker(workerScript);
    try {
        return await new Promise<R>((resolve, reject) => {
            worker.on('message', (result: R) => {
                if ((result as any)?.log) {
                    console.error('Worker Log--->:', (result as { log: string }).log);
                }
                if ((result as any)?.error) {
                    reject(new Error("Worker error: " + (result as { error: string }).error));
                }
                resolve(result);
            });

            worker.on('error', (error) => {
                reject(new Error(`Worker error: ${error.message}`));
            });

            worker.on('exit', (code) => {
                if (code !== 0) {
                    reject(new Error(`Worker stopped with exit code ${code}`));
                }
            });
            worker.postMessage(taskData);
        });
    } catch (error: unknown) {
        throw new Error(`Failed to run task: ${(error as Error).message}`);
    } finally {
        // Ensure the worker is terminated after the promise is settled
        worker.terminate();
    }
}

