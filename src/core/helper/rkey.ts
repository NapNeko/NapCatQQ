import { LogWrapper } from '@/common/log';
import { RequestUtil } from '@/common/request';

interface ServerRkeyData {
    group_rkey: string;
    private_rkey: string;
    expired_time: number;
}

export class RkeyManager {
    serverUrl: string[] = [];
    logger: LogWrapper;
    private rkeyData: ServerRkeyData = {
        group_rkey: '',
        private_rkey: '',
        expired_time: 0,
    };
    private failureCount: number = 0;
    private lastFailureTimestamp: number = 0;
    private readonly FAILURE_LIMIT: number = 8;
    private readonly ONE_DAY: number = 24 * 60 * 60 * 1000;

    constructor(serverUrl: string[], logger: LogWrapper) {
        this.logger = logger;
        this.serverUrl = serverUrl;
    }

    async getRkey() {
        const now = new Date().getTime();
        if (now - this.lastFailureTimestamp > this.ONE_DAY) {
            this.failureCount = 0; // 重置失败计数器
        }

        if (this.failureCount >= this.FAILURE_LIMIT) {
            this.logger.logError(`[Rkey] 服务存在异常, 图片使用FallBack机制`);
            throw new Error('获取rkey失败次数过多，请稍后再试');
        }

        if (this.isExpired()) {
            try {
                await this.refreshRkey();
            } catch (e) {
                throw new Error(`${e}`);//外抛
            }
        }
        return this.rkeyData;
    }

    isExpired(): boolean {
        const now = new Date().getTime() / 1000;
        return now > this.rkeyData.expired_time;
    }

    async refreshRkey(): Promise<any> {
        //刷新rkey
        for (const url of this.serverUrl) {
            try {
                const temp = await RequestUtil.HttpGetJson<ServerRkeyData>(url, 'GET');
                this.rkeyData = {
                    group_rkey: temp.group_rkey.slice(6),
                    private_rkey: temp.private_rkey.slice(6),
                    expired_time: temp.expired_time
                };
                this.failureCount = 0;
                return;
            } catch (e) {
                this.logger.logError(`[Rkey] 异常服务 ${url} 异常 / `, e);
                this.failureCount++;
                this.lastFailureTimestamp = new Date().getTime();
                //是否为最后一个url
                if (url === this.serverUrl[this.serverUrl.length - 1]) {
                    throw new Error(`获取rkey失败: ${e}`);//外抛
                }
            }
        }
    }
}