type Handler<T> = () => T | Promise<T>;

export class Fallback<T> {
    private handlers: Handler<T>[] = [];

    add(handler: Handler<T>): this {
        this.handlers.push(handler);
        return this;
    }

    // 执行处理程序链
    async run(): Promise<T> {
        const errors: Error[] = [];
        for (const handler of this.handlers) {
            try {
                const result = await handler();
                if (result !== undefined) {
                    return result;
                }
            } catch (error) {
                errors.push(error instanceof Error ? error : new Error(String(error)));
            }
        }
        throw new AggregateError(errors, 'All handlers failed');
    }
}