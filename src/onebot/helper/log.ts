import { Group, NapCatCore } from '@/core';
import { OB11Message } from '@/onebot/types';
import chalk from 'chalk';

const spSegColor = chalk.blue;// for special segment
const spColor = chalk.cyan;// for special

// todo: 应该放到core去用RawMessage解析打印
export async function logOB11Message(coreContext: NapCatCore, ob11Message: OB11Message) {
    const isSelfSent = ob11Message.sender.user_id.toString() === coreContext.selfInfo.uin;
    let prefix = '';
    let group: Group | undefined;
    if (isSelfSent) {
        prefix = '发送消息 ';
        if (ob11Message.message_type === 'private') {
            prefix += '给私聊 ';
            prefix += `${ob11Message.target_id}`;
        } else {
            prefix += '给群聊 ';
        }
    }
    if (ob11Message.message_type === 'group') {
        if (ob11Message.group_id == 284840486) {
            // group = await coreContext.ApiContext.GroupApi.getGroup(ob11Message.group_id!.toString());
            prefix += '转发消息[外部来源] ';
        } else {
            group = await coreContext.ApiContext.GroupApi.getGroup(ob11Message.group_id!.toString());
            prefix += `群[${group?.groupName}(${ob11Message.group_id})] `;
        }
    }
    let msgChain: string;
    if (Array.isArray(ob11Message.message)) {
        const msgParts = [];
        for (const segment of ob11Message.message) {
            if (segment.type === 'text') {
                msgParts.push(segment.data.text);
            } else if (segment.type === 'at') {
                const groupMember = await coreContext.ApiContext.GroupApi.getGroupMember(ob11Message.group_id!, segment.data.qq!);
                msgParts.push(spSegColor(`[@${groupMember?.cardName || groupMember?.nick}(${segment.data.qq})]`));
            } else if (segment.type === 'reply') {
                msgParts.push(spSegColor(`[回复消息|id:${segment.data.id}]`));
            } else if (segment.type === 'image') {
                msgParts.push(spSegColor(`[图片|${segment.data.url}]`));
            } else if (segment.type === 'face') {
                msgParts.push(spSegColor(`[表情|id:${segment.data.id}]`));
            } else if (segment.type === 'mface') {
                // @ts-expect-error 商城表情 url
                msgParts.push(spSegColor(`[商城表情|${segment.data.url}]`));
            } else if (segment.type === 'record') {
                msgParts.push(spSegColor(`[语音|${segment.data.file}]`));
            } else if (segment.type === 'file') {
                msgParts.push(spSegColor(`[文件|${segment.data.file}]`));
            } else if (segment.type === 'json') {
                msgParts.push(spSegColor(`[json|${JSON.stringify(segment.data)}]`));
            } else if (segment.type === 'markdown') {
                msgParts.push(spSegColor(`[markdown|${segment.data.content}]`));
            } else if (segment.type === 'video') {
                msgParts.push(spSegColor(`[视频|${segment.data.url}]`));
            } else if (segment.type === 'forward') {
                msgParts.push(spSegColor(`[转发|${segment.data.id}|消息开始]`));
                segment.data.content.forEach((msg) => {
                    logOB11Message(coreContext, msg);
                });
                msgParts.push(spSegColor(`[转发|${segment.data.id}|消息结束]`));
            } else {
                msgParts.push(spSegColor(`[未实现|${JSON.stringify(segment)}]`));
            }
        }
        msgChain = msgParts.join(' ');
    } else {
        msgChain = ob11Message.message;
    }
    let msgString = `${prefix}${ob11Message.sender.nickname}(${ob11Message.sender.user_id}): ${msgChain}`;
    if (isSelfSent) {
        msgString = `${prefix}: ${msgChain}`;
    }
    coreContext.context.logger.log(msgString);
}

export async function logOB11Notice(coreContext: NapCatCore, ob11Notice: any) {
    coreContext.context.logger.log(spColor('[Notice]'), ob11Notice);
}

export async function logOB11Request(coreContext: NapCatCore, ob11Request: any) {
    coreContext.context.logger.log(spColor('[Request]'), ob11Request);
}
