import { InstanceContext, NapCatCore } from '..';
import { RequestUtil } from '@/common/request';
import offset from '@/core/external/offset.json';
import * as crypto from 'crypto';
import { PacketClient } from '../helper/packet';

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
    PacketClient: PacketClient | undefined;
    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
        let config = this.core.configLoader.configData;
        if (config && config.packetServer && config.packetServer.length > 0) {
            let serverurl = this.core.configLoader.configData.packetServer ?? '127.0.0.1:8086';
            this.InitSendPacket(serverurl, this.context.basicInfoWrapper.getFullQQVesion())
                .then()
                .catch(this.core.context.logger.logError.bind(this.core.context.logger));
        }
    }
    async InitSendPacket(serverUrl: string, qqversion: string) {
        this.serverUrl = serverUrl;
        this.qqversion = qqversion;
        let offsetTable: OffsetType = offset;
        if (!offsetTable[qqversion]) return false;
        let url = 'ws://' + this.serverUrl + '/ws';
        this.PacketClient = new PacketClient(url, this.core.context.logger);
        await this.PacketClient.connect();
        await this.PacketClient.init(process.pid, offsetTable[qqversion].recv, offsetTable[qqversion].send);
        this.isInit = true;
        return this.isInit;
    }
    randText(len: number) {
        let text = '';
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < len; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    async sendPacket(cmd: string, data: string, rsp = false) {
        // wtfk tx
        // 校验失败和异常 可能返回undefined
        return new Promise((resolve, reject) => {
            if (!this.isInit || !this.PacketClient?.isConnected) {
                this.core.context.logger.logError('PacketClient is not init');
                return undefined;
            }
            let md5 = crypto.createHash('md5').update(data).digest('hex');
            let trace_id = (this.randText(4) + md5 + data).slice(0, data.length / 2);
            this.PacketClient?.sendCommand(cmd, data, trace_id, rsp, 5000, async () => {
                await this.core.context.session.getMsgService().sendSsoCmdReqByContend(cmd, trace_id);
            }).then((res) => resolve(res)).catch((e) => reject(e));
        });
    }
}