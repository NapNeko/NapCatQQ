type Handler<T> = () => T | Promise<T>;
type Checker<T> = (result: T) => T | Promise<T>;

export class Fallback<T> {
    private handlers: Handler<T>[] = [];
    private checker: Checker<T>;

    constructor(checker?: Checker<T>) {
        this.checker = checker || (async (result: T) => result);
    }

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
                const data = await this.checker(result);
                if (data) {
                    return data;
                }
            } catch (error) {
                errors.push(error instanceof Error ? error : new Error(String(error)));
            }
        }
        throw new AggregateError(errors, 'All handlers failed');
    }
}
export class FallbackUtil {
    static boolchecker<T>(value: T, condition: boolean): T {
        if (condition) {
            return value;
        } else {
            throw new Error('Condition is false, throwing error');
        }
    }
}