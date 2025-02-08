export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            // 如果 source[key] 为 undefined，则跳过（保留 target[key]）
            if (source[key] === undefined) {
                continue;
            }
            if (
                target[key] !== undefined &&
                typeof target[key] === 'object' &&
                !Array.isArray(target[key]) &&
                typeof source[key] === 'object' &&
                !Array.isArray(source[key])
            ) {
                target[key] = deepMerge({ ...target[key] }, source[key]!) as T[Extract<keyof T, string>];
            } else {
                target[key] = source[key]! as T[Extract<keyof T, string>];
            }
        }
    }
    return target;
}
