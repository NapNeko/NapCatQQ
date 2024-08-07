//远端rkey获取
import { logError } from '@/common/utils/log';
import { RequestUtil } from '@/common/utils/request';

interface ServerRkeyData {
  group_rkey: string;
  private_rkey: string;
  expired_time: number;
}

class RkeyManager {
  serverUrl: string = '';
  private rkeyData: ServerRkeyData = {
    group_rkey: '',
    private_rkey: '',
    expired_time: 0
  };
  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
  }
  async getRkey() {
    if (this.isExpired()) {
      try {
        await this.refreshRkey();
      } catch (e) {
        logError('获取rkey失败', e);
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
    this.rkeyData = await RequestUtil.HttpGetJson<ServerRkeyData>(this.serverUrl, 'GET');
  }
}
export const rkeyManager = new RkeyManager('http://napcat-sign.wumiao.wang:2082/rkey');
