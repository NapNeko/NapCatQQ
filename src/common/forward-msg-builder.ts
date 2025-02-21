import * as crypto from 'node:crypto';
import { PacketMsg } from '@/core/packet/message/message';

interface ForwardMsgJson {
    app: string
    config: ForwardMsgJsonConfig,
    desc: string,
    extra: ForwardMsgJsonExtra,
    meta: ForwardMsgJsonMeta,
    prompt: string,
    ver: string,
    view: string
}

interface ForwardMsgJsonConfig {
    autosize: number,
    forward: number,
    round: number,
    type: string,
    width: number
}

interface ForwardMsgJsonExtra {
    filename: string,
    tsum: number,
}

interface ForwardMsgJsonMeta {
    detail: ForwardMsgJsonMetaDetail
}

interface ForwardMsgJsonMetaDetail {
    news: {
        text: string
    }[],
    resid: string,
    source: string,
    summary: string,
    uniseq: string
}

interface ForwardAdaptMsg {
    senderName?: string;
    isGroupMsg?: boolean;
    msg?: ForwardAdaptMsgElement[];
}

interface ForwardAdaptMsgElement {
    preview?: string;
}

export class ForwardMsgBuilder {
    private static build(resId: string, msg: ForwardAdaptMsg[], source?: string, news?: ForwardMsgJsonMetaDetail['news'], summary?: string, prompt?: string): ForwardMsgJson {
        const id = crypto.randomUUID();
        const isGroupMsg = msg.some(m => m.isGroupMsg);
        if (!source) {
            source = msg.length === 0 ? '聊天记录' : (isGroupMsg ? '群聊的聊天记录' : msg.map(m => m.senderName).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4).join('和') + '的聊天记录');
        }
        if (!news) {
            news = msg.length === 0 ? [{
                text: 'Nya~ This message is send from NapCat.Packet!',
            }] : msg.map(m => ({
                text: `${m.senderName}: ${m.msg?.map(msg => msg.preview).join('')}`,
            }));
        }
        if (!summary) {
            summary = `查看${msg.length}条转发消息`;
        }
        if (!prompt) {
            prompt = '[聊天记录]';
        }
        return {
            app: 'com.tencent.multimsg',
            config: {
                autosize: 1,
                forward: 1,
                round: 1,
                type: 'normal',
                width: 300
            },
            desc: prompt,
            extra: {
                filename: id,
                tsum: msg.length,
            },
            meta: {
                detail: {
                    news,
                    resid: resId,
                    source,
                    summary,
                    uniseq: id,
                }
            },
            prompt,
            ver: '0.0.0.5',
            view: 'contact',
        };
    }

    static fromResId(resId: string): ForwardMsgJson {
        return this.build(resId, []);
    }

    static fromPacketMsg(resId: string, packetMsg: PacketMsg[], source?: string, news?: ForwardMsgJsonMetaDetail['news'], summary?: string, prompt?: string): ForwardMsgJson {
        return this.build(resId, packetMsg.map(msg => ({
            senderName: msg.senderName,
            isGroupMsg: msg.groupId !== undefined,
            msg: msg.msg.map(m => ({
                preview: m.valid ? m.toPreview() : '[该消息类型暂不支持查看]',
            }))
        })), source, news, summary, prompt);
    }
}
