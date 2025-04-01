import fs from 'fs';
// generate Claude 3.7 Sonet Thinking

interface FileRecord {
    filePath: string;
    addedTime: number;
    retries: number;
}

interface CleanupTask {
    fileRecord: FileRecord;
    timer: NodeJS.Timeout;
}

class CleanupQueue {
    private tasks: Map<string, CleanupTask> = new Map();
    private readonly MAX_RETRIES = 3;
    private isProcessing: boolean = false;
    private pendingOperations: Array<() => void> = [];

    /**
     * 执行队列中的待处理操作，确保异步安全
     */
    private executeNextOperation(): void {
        if (this.pendingOperations.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const operation = this.pendingOperations.shift();
        operation?.();

        // 使用 setImmediate 允许事件循环继续，防止阻塞
        setImmediate(() => this.executeNextOperation());
    }

    /**
     * 安全执行操作，防止竞态条件
     * @param operation 要执行的操作
     */
    private safeExecute(operation: () => void): void {
        this.pendingOperations.push(operation);
        if (!this.isProcessing) {
            this.executeNextOperation();
        }
    }

    /**
     * 检查文件是否存在
     * @param filePath 文件路径
     * @returns 文件是否存在
     */
    private fileExists(filePath: string): boolean {
        try {
            return fs.existsSync(filePath);
        } catch (error) {
            //console.log(`检查文件存在出错: ${filePath}`, error);
            return false;
        }
    }

    /**
     * 添加文件到清理队列
     * @param filePath 文件路径
     * @param cleanupDelay 清理延迟时间(毫秒)
     */
    addFile(filePath: string, cleanupDelay: number): void {
        this.safeExecute(() => {
            // 如果文件已在队列中，取消原来的计时器
            if (this.tasks.has(filePath)) {
                this.cancelCleanup(filePath);
            }

            // 创建新的文件记录
            const fileRecord: FileRecord = {
                filePath,
                addedTime: Date.now(),
                retries: 0
            };

            // 设置计时器
            const timer = setTimeout(() => {
                this.cleanupFile(fileRecord, cleanupDelay);
            }, cleanupDelay);

            // 添加到任务队列
            this.tasks.set(filePath, { fileRecord, timer });
        });
    }

    /**
     * 批量添加文件到清理队列
     * @param filePaths 文件路径数组
     * @param cleanupDelay 清理延迟时间(毫秒)
     */
    addFiles(filePaths: string[], cleanupDelay: number): void {
        this.safeExecute(() => {
            for (const filePath of filePaths) {
                // 内部直接处理，不通过 safeExecute 以保证批量操作的原子性
                if (this.tasks.has(filePath)) {
                    // 取消已有的计时器，但不使用 cancelCleanup 方法以避免重复的安全检查
                    const existingTask = this.tasks.get(filePath);
                    if (existingTask) {
                        clearTimeout(existingTask.timer);
                    }
                }

                const fileRecord: FileRecord = {
                    filePath,
                    addedTime: Date.now(),
                    retries: 0
                };

                const timer = setTimeout(() => {
                    this.cleanupFile(fileRecord, cleanupDelay);
                }, cleanupDelay);

                this.tasks.set(filePath, { fileRecord, timer });
            }
        });
    }

    /**
     * 清理文件
     * @param record 文件记录
     * @param delay 延迟时间，用于重试
     */
    private cleanupFile(record: FileRecord, delay: number): void {
        this.safeExecute(() => {
            // 首先检查文件是否存在，不存在则视为清理成功
            if (!this.fileExists(record.filePath)) {
                //console.log(`文件已不存在，跳过清理: ${record.filePath}`);
                this.tasks.delete(record.filePath);
                return;
            }

            try {
                // 尝试删除文件
                fs.unlinkSync(record.filePath);
                // 删除成功，从队列中移除任务
                this.tasks.delete(record.filePath);
            } catch (error) {
                const err = error as NodeJS.ErrnoException;

                // 明确处理文件不存在的情况
                if (err.code === 'ENOENT') {
                    //console.log(`文件在删除时不存在，视为清理成功: ${record.filePath}`);
                    this.tasks.delete(record.filePath);
                    return;
                }

                // 文件没有访问权限等情况
                if (err.code === 'EACCES' || err.code === 'EPERM') {
                    //console.error(`没有权限删除文件: ${record.filePath}`, err);
                }

                // 其他删除失败情况，考虑重试
                if (record.retries < this.MAX_RETRIES - 1) {
                    // 还有重试机会，增加重试次数
                    record.retries++;
                    //console.log(`清理文件失败，将重试(${record.retries}/${this.MAX_RETRIES}): ${record.filePath}`);

                    // 设置相同的延迟时间再次尝试
                    const timer = setTimeout(() => {
                        this.cleanupFile(record, delay);
                    }, delay);

                    // 更新任务
                    this.tasks.set(record.filePath, { fileRecord: record, timer });
                } else {
                    // 已达到最大重试次数，从队列中移除任务
                    this.tasks.delete(record.filePath);
                    //console.error(`清理文件失败，已达最大重试次数(${this.MAX_RETRIES}): ${record.filePath}`, error);
                }
            }
        });
    }

    /**
     * 取消文件的清理任务
     * @param filePath 文件路径
     * @returns 是否成功取消
     */
    cancelCleanup(filePath: string): boolean {
        let cancelled = false;
        this.safeExecute(() => {
            const task = this.tasks.get(filePath);
            if (task) {
                clearTimeout(task.timer);
                this.tasks.delete(filePath);
                cancelled = true;
            }
        });
        return cancelled;
    }

    /**
     * 获取队列中的文件数量
     * @returns 文件数量
     */
    getQueueSize(): number {
        return this.tasks.size;
    }

    /**
     * 获取所有待清理的文件
     * @returns 文件路径数组
     */
    getPendingFiles(): string[] {
        return Array.from(this.tasks.keys());
    }

    /**
     * 清空所有清理任务
     */
    clearAll(): void {
        this.safeExecute(() => {
            // 取消所有定时器
            for (const task of this.tasks.values()) {
                clearTimeout(task.timer);
            }
            this.tasks.clear();
            //console.log('已清空所有清理任务');
        });
    }
}

export const cleanTaskQueue = new CleanupQueue();