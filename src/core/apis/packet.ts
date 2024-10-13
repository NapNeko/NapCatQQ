import { InstanceContext, NapCatCore } from '..';
import { RequestUtil } from '@/common/request';
import offset from '@/core/external/offset.json';
import * as crypto from 'crypto';
import { PacketClient } from '../helper/packet';
import { NapProtoMsg } from '../proto/NapProto';
import { OidbSvcTrpcTcp0X9067_202 } from '../proto/oidb/Oidb.0x9067_202';
import { OidbSvcTrpcTcpBase } from '../proto/oidb/OidbBase';
import { OidbSvcTrpcTcp0XFE1_2, OidbSvcTrpcTcp0XFE1_2RSP } from '../proto/oidb/Oidb.fe1_2';

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
    async sendPacket(cmd: string, data: string, rsp = false): Promise<any> {
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
    async buildRkeyPacket() {
        let oidb_0x9067_202 = new NapProtoMsg(OidbSvcTrpcTcp0X9067_202).encode({
            reqHead: {
                common: {
                    requestId: 1,
                    command: 2
                },
                scene: {
                    requestType: 2,
                    businessType: 1,
                    sceneType: 0
                },
                clent: {
                    agentType: 2
                }
            },
            downloadRKeyReq: [[{ key: 10 }, { key: 20 }], { key: 2 }],
        });
        let oidb_packet = new NapProtoMsg(OidbSvcTrpcTcpBase).encode({
            command: 0x9067,
            subCommand: 202,
            body: oidb_0x9067_202,
            isReserved: 1
        });
        return oidb_packet;
    }
    async buildStatusPacket(uin: number) {

        let oidb_0xfe1_2 = new NapProtoMsg(OidbSvcTrpcTcp0XFE1_2).encode({
            uin: uin,
            key: [{ key: 27372 }]
        });
        let oidb_packet = new NapProtoMsg(OidbSvcTrpcTcpBase).encode({
            command: 0xfe1,
            subCommand: 2,
            body: oidb_0xfe1_2,
            isReserved: 1
        });
        return oidb_packet;
    }
    async sendStatusPacket(uin: number): Promise<{ status: number; ext_status: number; } | undefined> {
        let status = 0;
        try {
            let packet = Buffer.from(await this.core.apis.PacketApi.buildStatusPacket(uin)).toString('hex');
            let ret = await this.core.apis.PacketApi.sendPacket('OidbSvcTrpcTcp.0xfe1_2', packet, true);
            console.log('ret: ', ret);
            let data = Buffer.from(ret.hex_data, 'hex');
            let ext = new NapProtoMsg(OidbSvcTrpcTcp0XFE1_2RSP).decode(new NapProtoMsg(OidbSvcTrpcTcpBase).decode(data).body).data.status.value;
            // ext & 0xff00 + ext >> 16 & 0xff
            let extBigInt = BigInt(ext); // 转换为 BigInt
            if (extBigInt <= 10n) {
                return { status: Number(extBigInt) * 10, ext_status: 0 };
            }
            status = Number((extBigInt & 0xff00n) + ((extBigInt >> 16n) & 0xffn)); // 使用 BigInt 操作符
            return { status: 10, ext_status: status };
        } catch (error) {
            return undefined
        }
        return { status: status, ext_status: 0 };
    }
}