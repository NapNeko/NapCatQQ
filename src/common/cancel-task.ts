type TaskExecutor<T> = (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void, onCancel: (callback: () => void) => void) => void;

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

            executor(
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


async function demoAwait() {
    const executor: TaskExecutor<number> = (resolve, reject, onCancel) => {
        let count = 0;
        const intervalId = setInterval(() => {
            count++;
            console.log(`Task is running... Count: ${count}`);
            if (count === 5) {
                clearInterval(intervalId);
                resolve(count);
            }
        }, 1000);

        onCancel(() => {
            clearInterval(intervalId);
            console.log('Task has been canceled.');
            reject(new Error('Task was canceled'));
        });
    };

    const task = new CancelableTask(executor);

    task.onCancel(() => {
        console.log('Cancel listener triggered.');
    });

    setTimeout(() => {
        task.cancel(); // 取消任务
    }, 6000);

    try {
        const result = await task;
        console.log(`Task completed with result: ${result}`);
    } catch (error) {
        console.error('Task failed:', error);
    }
}