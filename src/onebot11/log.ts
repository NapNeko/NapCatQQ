import { OB11Message } from '@/onebot11/types';
import { log } from '@/common/utils/log';
import { getGroup, getGroupMember } from '@/core/data';
import exp from 'constants';

export async function logMessage(ob11Message: OB11Message){
  let prefix = '';
  if (ob11Message.message_type === 'group') {
    const group = await getGroup(ob11Message.group_id!);
    prefix = `群[${group?.groupName}(${ob11Message.group_id})] `;
  }
  let msgChain = '';
  if (Array.isArray(ob11Message.message)) {
    for (const segment of ob11Message.message) {
      if (segment.type === 'text') {
        msgChain += segment.data.text + '\n';
      }
      else if (segment.type === 'at') {
        const groupMember = await getGroupMember(ob11Message.group_id!, segment.data.qq!);
        msgChain += `@${groupMember?.cardName || groupMember?.nick}(${segment.data.qq}) `;
      }
      else if (segment.type === 'reply') {
        msgChain += `回复消息(id:${segment.data.id}) `;
      }
      else if (segment.type === 'image') {
        msgChain += `\n[图片]${segment.data.url}\n`;
      }
      else if (segment.type === 'face'){
        msgChain += `[表情](id:${segment.data.id}) `;
      }
      else if (segment.type === 'mface'){
        msgChain += `\n[商城表情]${segment.data.url}\n`;
      }
      else if (segment.type === 'record') {
        msgChain += `[语音]${segment.data.file} `;
      }
      else if (segment.type === 'file') {
        msgChain += `[文件]${segment.data.file} `;
      }
      else if (segment.type === 'json') {
        msgChain += `\n[json]${JSON.stringify(segment.data)}\n`;
      }
      else if (segment.type === 'markdown') {
        msgChain += `\n[json]${segment.data.content}\n`;
      }
      else {
        msgChain += `${JSON.stringify(segment)}`;
      }
    }
  }
  else {
    msgChain = ob11Message.message;
  }
  const msgString = `${prefix}${ob11Message.sender.nickname}(${ob11Message.sender.user_id}): ${msgChain}`;
  log(msgString);
}

export async function logNotice(ob11Notice: any){
  log('[notice]', ob11Notice);
}

export async function logRequest(ob11Request: any){
  log('[request]', ob11Request);
}
