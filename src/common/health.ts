export interface ResourceConfig<T extends any[], R> {
    /** 资源获取函数 */
    resourceFn: (...args: T) => Promise<R>;
    /** 失败后禁用时间（毫秒），默认 30 秒 */
    disableTime?: number;
    /** 最大重试次数，默认 3 次 */
    maxRetries?: number;
    /** 主动测试间隔（毫秒），默认 60 秒 */
    healthCheckInterval?: number;
    /** 最大健康检查失败次数，超过后永久禁用，默认 5 次 */
    maxHealthCheckFailures?: number;
    /** 资源名称（用于日志） */
    name?: string;
    /** 测试参数（用于健康检查） */
    testArgs?: T;
    /** 健康检查函数，如果提供则优先使用此函数进行健康检查 */
    healthCheckFn?: (...args: T) => Promise<boolean>;
}

interface ResourceState<T extends any[], R> {
    config: ResourceConfig<T, R>;
    isEnabled: boolean;
    disableUntil: number;
    currentRetries: number;
    healthCheckFailureCount: number;
    isPermanentlyDisabled: boolean;
    lastError?: Error;
    lastHealthCheckTime: number;
    registrationKey: string;
}

export class ResourceManager {
    private resources = new Map<string, ResourceState<any, any>>();
    private destroyed = false;
    private healthCheckTimer?: NodeJS.Timeout;
    private readonly HEALTH_CHECK_TASK_INTERVAL = 5000; // 5秒执行一次健康检查任务

    constructor() {
        this.startHealthCheckTask();
    }

    /**
     * 注册资源（注册即调用，重复注册只实际注册一次）
     */
    async register<T extends any[], R>(
        key: string,
        config: ResourceConfig<T, R>,
        ...args: T
    ): Promise<R> {
        if (this.destroyed) {
            throw new Error('ResourceManager has been destroyed');
        }

        const registrationKey = this.generateRegistrationKey(key, config);

        // 检查是否已经注册
        if (this.resources.has(key)) {
            const existingState = this.resources.get(key)!;

            // 如果是相同的配置，直接调用
            if (existingState.registrationKey === registrationKey) {
                return this.callResource<T, R>(key, ...args);
            }

            // 配置不同，清理旧的并重新注册
            this.unregister(key);
        }

        // 创建新的资源状态
        const state: ResourceState<T, R> = {
            config: {
                disableTime: 30000,
                maxRetries: 3,
                healthCheckInterval: 60000,
                maxHealthCheckFailures: 5,
                name: key,
                ...config
            },
            isEnabled: true,
            disableUntil: 0,
            currentRetries: 0,
            healthCheckFailureCount: 0,
            isPermanentlyDisabled: false,
            lastHealthCheckTime: 0,
            registrationKey
        };

        this.resources.set(key, state);

        // 注册即调用
        return await this.callResource<T, R>(key, ...args);
    }

    /**
     * 调用资源
     */
    async callResource<T extends any[], R>(key: string, ...args: T): Promise<R> {
        const state = this.resources.get(key) as ResourceState<T, R> | undefined;
        if (!state) {
            throw new Error(`Resource ${key} not registered`);
        }

        if (state.isPermanentlyDisabled) {
            throw new Error(`Resource ${key} is permanently disabled due to repeated health check failures`);
        }

        if (!this.isResourceAvailable(key)) {
            const disableUntilDate = new Date(state.disableUntil).toISOString();
            throw new Error(`Resource ${key} is currently disabled until ${disableUntilDate}`);
        }

        try {
            const result = await state.config.resourceFn(...args);
            this.onResourceSuccess(state);
            return result;
        } catch (error) {
            this.onResourceFailure(state, error as Error);
            throw error;
        }
    }

    /**
     * 检查资源是否可用
     */
    isResourceAvailable(key: string): boolean {
        const state = this.resources.get(key);
        if (!state) {
            return false;
        }

        if (state.isPermanentlyDisabled || !state.isEnabled) {
            return false;
        }

        return Date.now() >= state.disableUntil;
    }

    /**
     * 注销资源
     */
    unregister(key: string): boolean {
        return this.resources.delete(key);
    }

    /**
     * 销毁管理器，清理所有资源
     */
    destroy(): void {
        if (this.destroyed) {
            return;
        }

        this.stopHealthCheckTask();
        this.resources.clear();
        this.destroyed = true;
    }

    private generateRegistrationKey<T extends any[], R>(key: string, config: ResourceConfig<T, R>): string {
        const configStr = JSON.stringify({
            name: config.name,
            disableTime: config.disableTime,
            maxRetries: config.maxRetries,
            healthCheckInterval: config.healthCheckInterval,
            maxHealthCheckFailures: config.maxHealthCheckFailures,
            functionStr: config.resourceFn.toString(),
            healthCheckFnStr: config.healthCheckFn?.toString()
        });

        return `${key}_${this.simpleHash(configStr)}`;
    }

    private simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }

    private onResourceSuccess<T extends any[], R>(state: ResourceState<T, R>): void {
        state.currentRetries = 0;
        state.disableUntil = 0;
        state.healthCheckFailureCount = 0;
        state.lastError = undefined;
    }

    private onResourceFailure<T extends any[], R>(state: ResourceState<T, R>, error: Error): void {
        state.currentRetries++;
        state.lastError = error;

        // 如果重试次数达到上限，禁用资源
        if (state.currentRetries >= state.config.maxRetries!) {
            state.disableUntil = Date.now() + state.config.disableTime!;
            state.currentRetries = 0;
        }
    }

    private startHealthCheckTask(): void {
        if (this.healthCheckTimer) {
            return;
        }

        this.healthCheckTimer = setInterval(() => {
            this.runHealthCheckTask();
        }, this.HEALTH_CHECK_TASK_INTERVAL);
    }

    private stopHealthCheckTask(): void {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = undefined;
        }
    }

    private async runHealthCheckTask(): Promise<void> {
        if (this.destroyed) {
            return;
        }

        const now = Date.now();

        for (const [key, state] of this.resources) {
            // 跳过永久禁用或可用的资源
            if (state.isPermanentlyDisabled || this.isResourceAvailable(key)) {
                continue;
            }

            // 跳过还在禁用期内的资源
            if (now < state.disableUntil) {
                continue;
            }

            // 检查是否需要进行健康检查（根据间隔时间）
            const lastHealthCheck = state.lastHealthCheckTime || 0;
            const healthCheckInterval = state.config.healthCheckInterval!;

            if (now - lastHealthCheck < healthCheckInterval) {
                continue;
            }

            // 执行健康检查
            await this.performHealthCheck(state);
        }
    }

    private async performHealthCheck<T extends any[], R>(state: ResourceState<T, R>): Promise<void> {
        state.lastHealthCheckTime = Date.now();

        try {
            let healthCheckResult: boolean;

            // 如果有专门的健康检查函数，使用它
            if (state.config.healthCheckFn) {
                const testArgs = state.config.testArgs || [] as unknown as T;
                healthCheckResult = await state.config.healthCheckFn(...testArgs);
            } else {
                // 否则使用原始函数进行检查
                const testArgs = state.config.testArgs || [] as unknown as T;
                await state.config.resourceFn(...testArgs);
                healthCheckResult = true;
            }

            if (healthCheckResult) {
                // 健康检查成功，重新启用
                state.isEnabled = true;
                state.disableUntil = 0;
                state.currentRetries = 0;
                state.healthCheckFailureCount = 0;
                state.lastError = undefined;
            } else {
                throw new Error('Health check function returned false');
            }
        } catch (error) {
            // 健康检查失败，增加失败计数
            state.healthCheckFailureCount++;
            state.lastError = error as Error;

            // 检查是否达到最大健康检查失败次数
            if (state.healthCheckFailureCount >= state.config.maxHealthCheckFailures!) {
                // 永久禁用资源
                state.isPermanentlyDisabled = true;
                state.disableUntil = 0;
            } else {
                // 继续禁用一段时间
                state.disableUntil = Date.now() + state.config.disableTime!;
            }
        }
    }
}

// 创建全局实例
export const resourceManager = new ResourceManager();

// 便捷函数
export async function registerResource<T extends any[], R>(
    key: string,
    config: ResourceConfig<T, R>,
    ...args: T
): Promise<R> {
    return resourceManager.register(key, config, ...args);
}

// 使用示例：
/*
await registerResource(
  'api-with-health-check',
  {
    resourceFn: async (id: string) => {
      const response = await fetch(`https://api.example.com/data/${id}`);
      return response.json();
    },
    healthCheckFn: async (id: string) => {
      try {
        const response = await fetch(`https://api.example.com/health`);
        return response.ok;
      } catch {
        return false;
      }
    },
    testArgs: ['health-check-id'],
    healthCheckInterval: 30000,
    maxHealthCheckFailures: 3
  },
  'user123'
);
*/