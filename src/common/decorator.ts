// decoratorAsyncMethod(this,function,wrapper)
async function decoratorMethod<T, R>(
    target: T, 
    method: () => Promise<R>, 
    wrapper: (result: R) => Promise<any>, 
    executeImmediately: boolean = true
): Promise<any> {
    const execute = async () => {
        try {
            const result = await method.call(target);
            return wrapper(result);
        } catch (error) {
            return Promise.reject(error instanceof Error ? error : new Error(String(error)));
        }
    };

    if (executeImmediately) {
        return execute();
    } else {
        return execute;
    }
}