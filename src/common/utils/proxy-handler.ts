import { LogWrapper } from './log';

export function proxyHandlerOf(logger: LogWrapper) {
    return {
        get(target: any, prop: any, receiver: any) {
            if (typeof target[prop] === 'undefined') {
                // 如果方法不存在，返回一个函数，这个函数调用existentMethod
                return (..._args: unknown[]) => {
                    logger.logDebug(`${target.constructor.name} has no method ${prop}`);
                };
            }
            // 如果方法存在，正常返回
            return Reflect.get(target, prop, receiver);
        },
    };
}

export function proxiedListenerOf<T extends object>(listener: T, logger: LogWrapper) {
    return new Proxy<T>(listener, proxyHandlerOf(logger));
}
