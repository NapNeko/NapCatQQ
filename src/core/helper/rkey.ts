import { LogWrapper } from '@/common/log';
import { RequestUtil } from '@/common/request';

interface ServerRkeyData {
    group_rkey: string;
    private_rkey: string;
    expired_time: number;
}
interface OneBotApiRet {
    status: string,
    retcode: number,
    data: ServerRkeyData,
    message: string,
    wording: string,
}
interface UrlFailureInfo {
    count: number;
    lastTimestamp: number;
}

export class RkeyManager {
    serverUrl: string[] = [];
    logger: LogWrapper;
    private rkeyData: ServerRkeyData = {
        group_rkey: '',
        private_rkey: '',
        expired_time: 0,
    };
    private urlFailures: Map<string, UrlFailureInfo> = new Map();
    private readonly FAILURE_LIMIT: number = 4;
    private readonly ONE_DAY: number = 24 * 60 * 60 * 1000;

    constructor(serverUrl: string[], logger: LogWrapper) {
        this.logger = logger;
        this.serverUrl = serverUrl;
    }

    async getRkey() {
        const availableUrls = this.getAvailableUrls();
        if (availableUrls.length === 0) {
            this.logger.logError('[Rkey] 所有服务均已禁用, 图片使用FallBack机制');
            throw new Error('获取rkey失败：所有服务URL均已被禁用');
        }

        if (this.isExpired()) {
            try {
                await this.refreshRkey();
            } catch (e) {
                throw new Error(`${e}`);
            }
        }
        return this.rkeyData;
    }

    private getAvailableUrls(): string[] {
        return this.serverUrl.filter(url => !this.isUrlDisabled(url));
    }

    private isUrlDisabled(url: string): boolean {
        const failureInfo = this.urlFailures.get(url);
        if (!failureInfo) return false;

        const now = new Date().getTime();
        // 如果已经过了一天，重置失败计数
        if (now - failureInfo.lastTimestamp > this.ONE_DAY) {
            failureInfo.count = 0;
            this.urlFailures.set(url, failureInfo);
            return false;
        }

        return failureInfo.count >= this.FAILURE_LIMIT;
    }

    private updateUrlFailure(url: string) {
        const now = new Date().getTime();
        const failureInfo = this.urlFailures.get(url) || { count: 0, lastTimestamp: 0 };

        // 如果已经过了一天，重置失败计数
        if (now - failureInfo.lastTimestamp > this.ONE_DAY) {
            failureInfo.count = 1;
        } else {
            failureInfo.count++;
        }

        failureInfo.lastTimestamp = now;
        this.urlFailures.set(url, failureInfo);

        if (failureInfo.count >= this.FAILURE_LIMIT) {
            this.logger.logError(`[Rkey] URL ${url} 已被禁用，失败次数达到 ${this.FAILURE_LIMIT} 次`);
        }
    }

    isExpired(): boolean {
        const now = new Date().getTime() / 1000;
        return now > this.rkeyData.expired_time;
    }

    async refreshRkey() {
        const availableUrls = this.getAvailableUrls();

        if (availableUrls.length === 0) {
            this.logger.logError('[Rkey] 所有服务均已禁用');
            throw new Error('获取rkey失败：所有服务URL均已被禁用');
        }

        for (const url of availableUrls) {
            try {
                let temp = await RequestUtil.HttpGetJson<ServerRkeyData>(url, 'GET');
                if ('retcode' in temp) {
                    // 支持Onebot Ret风格
                    temp = (temp as unknown as OneBotApiRet).data;
                }
                this.rkeyData = {
                    group_rkey: temp.group_rkey.slice(6),
                    private_rkey: temp.private_rkey.slice(6),
                    expired_time: temp.expired_time
                };
                return;
            } catch (e) {
                this.logger.logError(`[Rkey] 异常服务 ${url} 异常 / `, e);
                this.updateUrlFailure(url);

                if (url === availableUrls[availableUrls.length - 1]) {
                    throw new Error(`获取rkey失败: ${e}`);
                }
            }
        }
    }
}