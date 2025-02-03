/* eslint-disable @typescript-eslint/no-explicit-any */
export type TaskExecutor<T> = (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void, onCancel: (callback: () => void) => void) => void | Promise<void>;

export class CancelableTask<T> {
    private promise: Promise<T>;
    private cancelCallback: (() => void) | null = null;
    private isCanceled = false;
    private cancelListeners: Array<() => void> = [];

    constructor(executor: TaskExecutor<T>) {
        this.promise = new Promise<T>((resolve, reject) => {
            const onCancel = (callback: () => void) => {
                this.cancelCallback = callback;
            };

            const execute = async () => {
                try {
                    await executor(
                        (value) => {
                            if (!this.isCanceled) {
                                resolve(value);
                            }
                        },
                        (reason) => {
                            if (!this.isCanceled) {
                                reject(reason);
                            }
                        },
                        onCancel
                    );
                } catch (error) {
                    if (!this.isCanceled) {
                        reject(error);
                    }
                }
            };

            execute();
        });
    }

    public cancel() {
        if (this.cancelCallback) {
            this.cancelCallback();
        }
        this.isCanceled = true;
        this.cancelListeners.forEach(listener => listener());
    }

    public isTaskCanceled(): boolean {
        return this.isCanceled;
    }

    public onCancel(listener: () => void) {
        this.cancelListeners.push(listener);
    }

    public then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): Promise<TResult1 | TResult2> {
        return this.promise.then(onfulfilled, onrejected);
    }

    public catch<TResult = never>(
        onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): Promise<T | TResult> {
        return this.promise.catch(onrejected);
    }

    public finally(onfinally?: (() => void) | undefined | null): Promise<T> {
        return this.promise.finally(onfinally);
    }

    [Symbol.asyncIterator]() {
        return {
            next: () => this.promise.then(value => ({ value, done: true })),
        };
    }
}