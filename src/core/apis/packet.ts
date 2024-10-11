import { InstanceContext, NapCatCore } from '..';
import { RequestUtil } from '@/common/request';
import offset from '@/core/external/offset.json';
import * as crypto from 'crypto';

interface OffsetType {
    [key: string]: {
        recv: string;
        send: string;
    };
}

const typedOffset: OffsetType = offset;
export class NTQQPacketApi {
    context: InstanceContext;
    core: NapCatCore;
    serverUrl: string | undefined;
    qqversion: string | undefined;
    isInit: boolean = false;
    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
        this.InitSendPacket('127.0.0.1:8086', '9.9.15-28418', '1001').then().catch();
    }
    async InitSendPacket(serverUrl: string, qqversion: string, uin: string) {
        this.serverUrl = serverUrl;
        this.qqversion = qqversion;
        let offsetTable: OffsetType = offset;
        if (!offsetTable[qqversion]) return false;
        let url = 'http://' + this.serverUrl + '/init';
        let postdata = { recv: offsetTable[qqversion].recv, send: offsetTable[qqversion].send, qqver: qqversion, uin: uin, pid: process.pid };
        try {
            let ret = await RequestUtil.HttpGetJson<any>(url, 'POST', postdata, { 'Content-Type': 'application/json' }, true, true);
            if (ret.status !== 'ok') throw new Error('InitSendPacket failed' + JSON.stringify(ret, null, 2));
        } catch (error) {
            let logger = this.core.context.logger;
            logger.logError.bind(logger)('InitSendPacket', error);
            return false;
        }
        this.isInit = true;
        return this.isInit;
    }
    async randText(len: number) {
        let text = '';
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < len; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    async sendPacket(cmd: string, data: string, rep = false) {
        return new Promise(async (resolve, reject) => {
            //获取data的HASH
            let md5 = crypto.createHash('md5').update(data).digest('hex');
            let url = 'http://' + this.serverUrl + '/send';
            let geturl = 'http://' + this.serverUrl + '/get';
            let trace_id = (await this.randText(4) + md5 + data).slice(0, data.length / 2);
            let postdata = { data: data, trace_id: trace_id, cmd: cmd };

            RequestUtil.HttpGetJson<any>(url, 'POST', postdata, { 'Content-Type': 'application/json' }, true, true).then((res) => {
                if (!rep) {
                    this.core.context.session.getMsgService().sendSsoCmdReqByContend(cmd, trace_id).then(e => resolve(res)).catch(e => reject(e))
                } else {
                    let getpostdata = { data: data, trace_id: trace_id, cmd: cmd };
                    RequestUtil.HttpGetJson<any>(geturl, 'POST', getpostdata, { 'Content-Type': 'application/json' }, true, true).then((rsp) => {
                        resolve(rsp)
                    }).catch((e) => reject(e));
                }
            }).catch((e) => reject(e));
        });
    }
}