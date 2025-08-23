import { OB11Sender } from './data';
import { EventType } from '@/onebot/event/OneBotEvent';
import { CustomMusicSignPostData, IdMusicSignPostData, PicSubType, RawMessage } from '@/core';

// 消息类型枚举
export enum OB11MessageType {
    private = 'private',
    group = 'group'
}

// 消息接口定义
export interface OB11Message {
    real_seq?: string;// 自行扩展
    temp_source?: number;
    message_sent_type?: string;
    target_id?: number;  // 自己发送消息/私聊消息
    self_id?: number;
    time: number;
    message_id: number;
    message_seq: number; // 和message_id一样
    real_id: number;
    user_id: number | string; // number
    group_id?: number | string; // number
    group_name?: string; // string
    message_type: 'private' | 'group';
    sub_type?: 'friend' | 'group' | 'normal';
    sender: OB11Sender;
    message: OB11MessageData[] | string;
    message_format: 'array' | 'string';
    raw_message: string;
    font: number;
    post_type?: EventType;
    raw?: RawMessage;
}

// 合并转发消息接口定义
export interface OB11ForwardMessage extends OB11Message {
    content: OB11MessageData[] | string;
}

// 返回数据接口定义
export interface OB11Return<DataType> {
    status: string;
    retcode: number;
    data: DataType;
    message: string;
    echo?: unknown; // ws调用api才有此字段
    wording?: string;  // go-cqhttp字段，错误信息
}

// 消息数据类型枚举
export enum OB11MessageDataType {
    text = 'text',
    image = 'image',
    music = 'music',
    video = 'video',
    voice = 'record',
    file = 'file',
    at = 'at',
    reply = 'reply',
    json = 'json',
    face = 'face',
    mface = 'mface', // 商城表情
    markdown = 'markdown',
    node = 'node',  // 合并转发消息节点
    forward = 'forward',  // 合并转发消息，用于上报
    xml = 'xml',
    poke = 'poke',
    dice = 'dice',
    rps = 'rps',
    miniapp = 'miniapp', // json类
    contact = 'contact',
    location = 'location'
}

export interface OB11MessagePoke {
    type: OB11MessageDataType.poke;
    data: {
        type: string;
        id: string;
    };
}

// 商城表情消息接口定义
export interface OB11MessageMFace {
    type: OB11MessageDataType.mface;
    data: {
        emoji_package_id: number;
        emoji_id: string;
        key: string;
        summary: string;
    };
}

// 纯文本消息接口定义
export interface OB11MessageText {
    type: OB11MessageDataType.text;
    data: {
        text: string; // 纯文本
    };
}

// 联系人消息接口定义
export interface OB11MessageContext {
    type: OB11MessageDataType.contact;
    data: {
        type: 'qq' | 'group';
        id: string;
    };
}

// 文件消息基础接口定义
export interface OB11MessageFileBase {
    data: {
        path?: string;
        thumb?: string;
        name?: string;
        file: string;
        url?: string;
    };
}

// 图片消息接口定义
export interface OB11MessageImage extends OB11MessageFileBase {
    type: OB11MessageDataType.image;
    data: OB11MessageFileBase['data'] & {
        summary?: string; // 图片摘要
        sub_type?: PicSubType;
    };
}

// 语音消息接口定义
export interface OB11MessageRecord extends OB11MessageFileBase {
    type: OB11MessageDataType.voice;
}

// 文件消息接口定义
export interface OB11MessageFile extends OB11MessageFileBase {
    type: OB11MessageDataType.file;
}

// 视频消息接口定义
export interface OB11MessageVideo extends OB11MessageFileBase {
    type: OB11MessageDataType.video;
}

// @消息接口定义
export interface OB11MessageAt {
    type: OB11MessageDataType.at;
    data: {
        qq: string; // `${number}` | 'all'
        name?: string;
    };
}

// 回复消息接口定义
export interface OB11MessageReply {
    type: OB11MessageDataType.reply;
    data: {
        id: string;
    };
}

// 表情消息接口定义
export interface OB11MessageFace {
    type: OB11MessageDataType.face;
    data: {
        id: string;
        resultId?: string;
        chainCount?: number;
    };
}

// 混合消息类型定义
export type OB11MessageMixType = OB11MessageData[] | string | OB11MessageData;

// 合并转发消息节点接口定义
export interface OB11MessageNode {
    type: OB11MessageDataType.node;
    data: {
        id?: string;
        user_id?: number | string;  // number
        uin?: number | string;  // number, compatible with go-cqhttp
        nickname: string;
        name?: string; // compatible with go-cqhttp
        content: OB11MessageMixType;
        source?: string;
        news?: { text: string }[];
        summary?: string;
        prompt?: string;
        time?: string;
    };
}

// 合并转发消息节点纯文本接口定义
export type OB11MessageNodePlain = OB11MessageNode & {
    data: {
        content?: Array<OB11MessageData>;
        message: Array<OB11MessageData>;
    };
};

// 音乐消息接口定义
export interface OB11MessageIdMusic {
    type: OB11MessageDataType.music;
    data: IdMusicSignPostData;
}

// 自定义音乐消息接口定义
export interface OB11MessageCustomMusic {
    type: OB11MessageDataType.music;
    data: Omit<CustomMusicSignPostData, 'singer'> & { content?: string };
}

// JSON消息接口定义
export interface OB11MessageJson {
    type: OB11MessageDataType.json;
    data: { config?: { token: string }, data: string | object };
}

// 骰子消息接口定义
export interface OB11MessageDice {
    type: OB11MessageDataType.dice;
    data: {
        result: number /* intended */ | string /* in fact */;
    };
}

// 猜拳消息接口定义
export interface OB11MessageRPS {
    type: OB11MessageDataType.rps;
    data: {
        result: number | string;
    };
}

// Markdown消息接口定义
export interface OB11MessageMarkdown {
    type: OB11MessageDataType.markdown;
    data: {
        content: string;
    };
}

// 合并转发消息接口定义
export interface OB11MessageForward {
    type: OB11MessageDataType.forward;
    data: {
        id: string;
        content?: OB11Message[];
    };
}

// 消息数据类型定义
export type OB11MessageData =
    OB11MessageText |
    OB11MessageFace | OB11MessageMFace |
    OB11MessageAt | OB11MessageReply |
    OB11MessageImage | OB11MessageRecord | OB11MessageFile | OB11MessageVideo |
    OB11MessageNode | OB11MessageIdMusic | OB11MessageCustomMusic | OB11MessageJson |
    OB11MessageDice | OB11MessageRPS | OB11MessageMarkdown | OB11MessageForward | OB11MessageContext | OB11MessagePoke;

// 发送消息接口定义
export interface OB11PostSendMsg {
    message_type?: 'private' | 'group';
    user_id?: string;
    group_id?: string;
    message: OB11MessageMixType;
    messages?: OB11MessageMixType;
    auto_escape?: boolean | string;
    source?: string;
    news?: { text: string }[];
    summary?: string;
    prompt?: string;
    time?: string;
}

// 上下文接口定义
export interface OB11PostContext {
    message_type?: 'private' | 'group';
    user_id?: string;
    group_id?: string;
}
