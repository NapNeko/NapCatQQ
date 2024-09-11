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
                this.logger.logError('获取rkey失败', e);
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
        for (let url of this.serverUrl) {
            try {
                this.rkeyData = await RequestUtil.HttpGetJson<ServerRkeyData>(url, 'GET');
            } catch (e) {
                this.logger.logError(`[Rkey] Get Rkey ${url} Error `, e);
            }
        }

    }
}
