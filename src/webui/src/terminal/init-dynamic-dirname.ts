import path from 'path';

Object.defineProperty(global, '__dirname', {
    get() {
        const err = new Error();
        const stack = err.stack?.split('\n') || [];
        let callerFile = '';
        // 遍历错误堆栈，跳过当前文件所在行
        // 注意：堆栈格式可能不同，请根据实际环境调整索引及正则表达式
        for (const line of stack) {
            const match = line.match(/\((.*):\d+:\d+\)/);
            if (match?.[1]) {
                callerFile = match[1];
                if (!callerFile.includes('init-dynamic-dirname.ts')) {
                    break;
                }
            }
        }
        return callerFile ? path.dirname(callerFile) : '';
    },
});
