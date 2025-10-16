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
    /** 健康检查函数，如果提供则优先使用此函数进行健康检查 */
    healthCheckFn?: (...args: T) => Promise<boolean>;
    /** 测试参数（用于健康检查） */
    testArgs?: T;
}

interface ResourceTypeState {
    /** 资源配置 */
    config: {
        resourceFn: (...args: any[]) => Promise<any>;
        healthCheckFn?: (...args: any[]) => Promise<boolean>;
        disableTime: number;
        maxRetries: number;
        healthCheckInterval: number;
        maxHealthCheckFailures: number;
        testArgs?: any[];
    };
    /** 是否启用 */
    isEnabled: boolean;
    /** 禁用截止时间 */
    disableUntil: number;
    /** 当前重试次数 */
    currentRetries: number;
    /** 健康检查失败次数 */
    healthCheckFailureCount: number;
    /** 是否永久禁用 */
    isPermanentlyDisabled: boolean;
    /** 上次健康检查时间 */
    lastHealthCheckTime: number;
    /** 成功次数统计 */
    successCount: number;
    /** 失败次数统计 */
    failureCount: number;
}

export class ResourceManager {
    private resourceTypes = new Map<string, ResourceTypeState>();
    private destroyed = false;

    /**
     * 调用资源（自动注册或复用已有配置）
     */
    async callResource<T extends any[], R>(
        type: string,
        config: ResourceConfig<T, R>,
        ...args: T
    ): Promise<R> {
        if (this.destroyed) {
            throw new Error('ResourceManager has been destroyed');
        }

        // 获取或创建资源类型状态
        let state = this.resourceTypes.get(type);

        if (!state) {
            // 首次注册
            state = {
                config: {
                    resourceFn: config.resourceFn as (...args: any[]) => Promise<any>,
                    healthCheckFn: config.healthCheckFn as ((...args: any[]) => Promise<boolean>) | undefined,
                    disableTime: config.disableTime ?? 30000,
                    maxRetries: config.maxRetries ?? 3,
                    healthCheckInterval: config.healthCheckInterval ?? 60000,
                    maxHealthCheckFailures: config.maxHealthCheckFailures ?? 20,
                    testArgs: config.testArgs as any[] | undefined,
                },
                isEnabled: true,
                disableUntil: 0,
                currentRetries: 0,
                healthCheckFailureCount: 0,
                isPermanentlyDisabled: false,
                lastHealthCheckTime: 0,
                successCount: 0,
                failureCount: 0,
            };
            this.resourceTypes.set(type, state);
        }

        // 在调用前检查是否需要进行健康检查
        await this.checkAndPerformHealthCheck(state);

        // 检查资源状态
        if (state.isPermanentlyDisabled) {
            throw new Error(`Resource type '${type}' is permanently disabled (success: ${state.successCount}, failure: ${state.failureCount})`);
        }

        if (!this.isResourceAvailable(type)) {
            const disableUntilDate = new Date(state.disableUntil).toISOString();
            throw new Error(`Resource type '${type}' is currently disabled until ${disableUntilDate} (success: ${state.successCount}, failure: ${state.failureCount})`);
        }

        // 调用资源
        try {
            const result = await config.resourceFn(...args);
            this.onResourceSuccess(state);
            return result;
        } catch (error) {
            this.onResourceFailure(state);
            throw error;
        }
    }

    /**
     * 检查资源类型是否可用
     */
    isResourceAvailable(type: string): boolean {
        const state = this.resourceTypes.get(type);
        if (!state) {
            return true; // 未注册的资源类型视为可用
        }

        if (state.isPermanentlyDisabled || !state.isEnabled) {
            return false;
        }

        return Date.now() >= state.disableUntil;
    }

    /**
     * 获取资源类型统计信息
     */
    getResourceStats(type: string): { successCount: number; failureCount: number; isEnabled: boolean; isPermanentlyDisabled: boolean } | null {
        const state = this.resourceTypes.get(type);
        if (!state) {
            return null;
        }

        return {
            successCount: state.successCount,
            failureCount: state.failureCount,
            isEnabled: state.isEnabled,
            isPermanentlyDisabled: state.isPermanentlyDisabled,
        };
    }

    /**
     * 获取所有资源类型统计
     */
    getAllResourceStats(): Map<string, { successCount: number; failureCount: number; isEnabled: boolean; isPermanentlyDisabled: boolean }> {
        const stats = new Map();
        for (const [type, state] of this.resourceTypes) {
            stats.set(type, {
                successCount: state.successCount,
                failureCount: state.failureCount,
                isEnabled: state.isEnabled,
                isPermanentlyDisabled: state.isPermanentlyDisabled,
            });
        }
        return stats;
    }

    /**
     * 注销资源类型
     */
    unregister(type: string): boolean {
        return this.resourceTypes.delete(type);
    }

    /**
     * 销毁管理器
     */
    destroy(): void {
        if (this.destroyed) {
            return;
        }

        this.resourceTypes.clear();
        this.destroyed = true;
    }

    /**
     * 检查并执行健康检查（如果需要）
     */
    private async checkAndPerformHealthCheck(state: ResourceTypeState): Promise<void> {
        // 如果资源可用或已永久禁用，无需健康检查
        if (state.isEnabled && Date.now() >= state.disableUntil) {
            return;
        }

        if (state.isPermanentlyDisabled) {
            return;
        }

        const now = Date.now();

        // 检查是否还在禁用期内
        if (now < state.disableUntil) {
            return;
        }

        // 检查是否需要进行健康检查（根据间隔时间）
        if (now - state.lastHealthCheckTime < state.config.healthCheckInterval) {
            return;
        }

        // 执行健康检查
        await this.performHealthCheck(state);
    }

    private async performHealthCheck(state: ResourceTypeState): Promise<void> {
        state.lastHealthCheckTime = Date.now();

        try {
            let healthCheckResult: boolean;

            if (state.config.healthCheckFn) {
                const testArgs = state.config.testArgs || [];
                healthCheckResult = await state.config.healthCheckFn(...testArgs);
            } else {
                const testArgs = state.config.testArgs || [];
                await state.config.resourceFn(...testArgs);
                healthCheckResult = true;
            }

            if (healthCheckResult) {
                // 健康检查成功，重新启用
                state.isEnabled = true;
                state.disableUntil = 0;
                state.currentRetries = 0;
                state.healthCheckFailureCount = 0;
            } else {
                throw new Error('Health check function returned false');
            }
        } catch {
            // 健康检查失败，增加失败计数
            state.healthCheckFailureCount++;

            // 检查是否达到最大健康检查失败次数
            if (state.healthCheckFailureCount >= state.config.maxHealthCheckFailures) {
                // 永久禁用资源
                state.isPermanentlyDisabled = true;
                state.disableUntil = 0;
            } else {
                // 继续禁用一段时间
                state.disableUntil = Date.now() + state.config.disableTime;
            }
        }
    }

    private onResourceSuccess(state: ResourceTypeState): void {
        state.currentRetries = 0;
        state.disableUntil = 0;
        state.healthCheckFailureCount = 0;
        state.successCount++;
    }

    private onResourceFailure(state: ResourceTypeState): void {
        state.currentRetries++;
        state.failureCount++;

        // 如果重试次数达到上限，禁用资源
        if (state.currentRetries >= state.config.maxRetries) {
            state.disableUntil = Date.now() + state.config.disableTime;
            state.currentRetries = 0;
        }
    }
}

// 创建全局实例
export const resourceManager = new ResourceManager();

// 便捷函数
export async function registerResource<T extends any[], R>(
    type: string,
    config: ResourceConfig<T, R>,
    ...args: T
): Promise<R> {
    return resourceManager.callResource(type, config, ...args);
}