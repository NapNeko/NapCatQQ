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

    constructor(serverUrl: string[], logger: LogWrapper) {
        this.logger = logger;
        this.serverUrl = serverUrl;
    }

    async getRkey() {
        if (this.isExpired()) {
            try {
                await this.refreshRkey();
            } catch (e) {
                throw new Error(`获取rkey失败: ${e}`);//外抛
                //this.logger.logError.bind(this.logger)('获取rkey失败', e);
            }
        }
        return this.rkeyData;
    }

    isExpired(): boolean {
        const now = new Date().getTime() / 1000;
        // console.log(`now: ${now}, expired_time: ${this.rkeyData.expired_time}`);
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
            } catch (e) {
                this.logger.logError.bind(this.logger)(`[Rkey] Get Rkey ${url} Error `, e);
                //是否为最后一个url
                if (url === this.serverUrl[this.serverUrl.length - 1]) {
                    throw new Error(`获取rkey失败: ${e}`);//外抛
                }
            }
        }

    }
}
