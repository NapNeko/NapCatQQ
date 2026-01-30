import { pb, processJson, randomUint, jsonDumpsWithBytes } from './protobuf';
import type { ToolResult } from '../types';

interface ActionMap {
  call: (action: string, params: unknown, adapter: string, config: unknown) => Promise<unknown>;
}

let packetMode: 1 | 2 = 2;
export const setPacketMode = (mode: 1 | 2) => { packetMode = mode; };
export const getPacketMode = () => packetMode;

function tryDecodeHex (hexStr: string): Record<number, unknown> | null {
  if (!hexStr || !/^[0-9a-fA-F]+$/.test(hexStr)) return null;
  try {
    const decoded = pb.decode(hexStr);
    return decoded && Object.keys(decoded).length > 0 ? decoded : null;
  } catch { return null; }
}

function extractHexData (obj: unknown): string | null {
  if (typeof obj === 'string' && /^[0-9a-fA-F]+$/.test(obj) && obj.length > 10) return obj;
  if (obj && typeof obj === 'object') {
    const record = obj as Record<string, unknown>;
    if (record.data) { const found = extractHexData(record.data); if (found) return found; }
    for (const value of Object.values(record)) { const found = extractHexData(value); if (found) return found; }
  }
  return null;
}

function decodeResponseData (data: unknown): unknown {
  if (typeof data === 'string') { const decoded = tryDecodeHex(data); return decoded ?? data; }
  if (Array.isArray(data)) return data.map(item => decodeResponseData(item));
  if (data && typeof data === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) result[key] = decodeResponseData(value);
    return result;
  }
  return data;
}

export async function sendPacket (
  actions: ActionMap, adapter: string, config: unknown, cmd: string, content: unknown
): Promise<ToolResult> {
  try {
    const dataHex = pb.bytesToHex(pb.encode(processJson(content)));
    const result = await actions.call('send_packet', { cmd, data: dataHex }, adapter, config);

    if (result && typeof result === 'object') {
      const hexData = extractHexData(result as Record<string, unknown>);
      if (hexData) {
        const decoded = tryDecodeHex(hexData);
        if (decoded) return { success: true, data: decoded };
      }
      return { success: true, data: decodeResponseData(result) };
    }
    if (typeof result === 'string') {
      const decoded = tryDecodeHex(result);
      if (decoded) return { success: true, data: decoded };
    }
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: `发送数据包失败: ${error}` };
  }
}

export async function sendElem (
  actions: ActionMap, adapter: string, config: unknown, targetId: string, isGroup: boolean, content: unknown
): Promise<ToolResult> {
  const packet: Record<number, unknown> = {
    1: { [isGroup ? 2 : 1]: { 1: parseInt(targetId) } },
    2: { 1: 1, 2: 0, 3: 0 },
    3: { 1: { 2: processJson(content) } },
    4: randomUint(),
    5: randomUint(),
  };
  return sendPacket(actions, adapter, config, 'MessageSvc.PbSendMsg', packet);
}

async function uploadLong (
  actions: ActionMap, adapter: string, config: unknown, targetId: string, isGroup: boolean, content: unknown
): Promise<string | null> {
  const data: Record<number, unknown> = { 2: { 1: 'MultiMsg', 2: { 1: [{ 3: { 1: { 2: processJson(content) } } }] } } };
  const packet: Record<number, unknown> = {
    2: { 1: isGroup ? 3 : 1, 2: { 2: parseInt(targetId) }, 3: targetId, 4: pb.encode(data) },
    15: { 1: 4, 2: 2, 3: 9, 4: 0 },
  };
  const resp = await sendPacket(actions, adapter, config, 'trpc.group.long_msg_interface.MsgService.SsoSendLongMsg', packet);
  if (resp.success && resp.data) {
    const field2 = (resp.data as Record<number, unknown>)[2] as Record<number, unknown> | undefined;
    return field2?.[3] as string | null;
  }
  return null;
}

export async function sendLong (
  actions: ActionMap, adapter: string, config: unknown, targetId: string, isGroup: boolean, content: unknown
): Promise<ToolResult> {
  const resid = await uploadLong(actions, adapter, config, targetId, isGroup, content);
  if (!resid) return { success: false, error: '上传长消息失败' };
  const elem: Record<number, unknown> = { 37: { 6: 1, 7: resid, 17: 0, 19: { 15: 0, 31: 0, 41: 0 } } };
  return sendElem(actions, adapter, config, targetId, isGroup, elem);
}

export async function getMessagePb (
  actions: ActionMap, adapter: string, config: unknown, groupId: string, messageId: string, realSeq?: string
): Promise<ToolResult> {
  if (!realSeq) {
    const msgInfo = await actions.call('get_msg', { message_id: messageId }, adapter, config) as Record<string, unknown>;
    if (msgInfo) realSeq = (msgInfo.retcode === 0 ? (msgInfo.data as Record<string, unknown>)?.real_seq : msgInfo.real_seq) as string;
    if (!realSeq) return { success: false, error: '未找到 real_seq' };
  }
  const seq = parseInt(realSeq);
  const packet: Record<number, unknown> = { 1: { 1: parseInt(groupId), 2: seq, 3: seq }, 2: true };
  return sendPacket(actions, adapter, config, 'trpc.msg.register_proxy.RegisterProxy.SsoGetGroupMsg', packet);
}

export function extractSenderInfo (pbData: Record<number, unknown>): { senderQQ: string | null; senderName: string | null; } {
  try {
    const field3 = pbData[3] as Record<number, unknown> | undefined;
    const field6 = field3?.[6] as Record<number, unknown> | undefined;
    const field1In6 = field6?.[1] as Record<number, unknown> | undefined;
    let senderQQ = field1In6?.[1] !== undefined ? String(field1In6[1]) : null;
    const field8 = field1In6?.[8] as Record<number, unknown> | undefined;
    const senderName = typeof field8?.[4] === 'string' ? field8[4] : null;
    if (senderQQ && !/^\d{5,12}$/.test(senderQQ)) senderQQ = null;
    return { senderQQ, senderName };
  } catch { return { senderQQ: null, senderName: null }; }
}

export function extractBodyData (pbData: Record<number, unknown>): unknown {
  try {
    return (((pbData[3] as Record<number, unknown>)?.[6] as Record<number, unknown>)?.[3] as Record<number, unknown>)?.[1]?.[2] ?? null;
  } catch { return null; }
}

function createFlatNode (botId: string, title: string, content: string): unknown {
  return { type: 'node', data: { user_id: botId, nickname: title, content: [{ type: 'text', data: { text: content } }] } };
}

function createNestedNode (botId: string, title: string, description: string, content: string): unknown {
  return {
    type: 'node',
    data: {
      user_id: botId,
      nickname: title,
      content: [
        { type: 'node', data: { user_id: botId, nickname: '📌 说明', content: [{ type: 'text', data: { text: description } }] } },
        { type: 'node', data: { user_id: botId, nickname: '📄 数据', content: [{ type: 'text', data: { text: content } }] } },
      ],
    },
  };
}

export function buildMessageNodes (
  botId: string, botName: string, realSeq: number, senderQQ: string | null, senderName: string | null,
  pbData: Record<number, unknown>, onebotData?: unknown
): unknown[] {
  const nodes: unknown[] = [];
  const infoParts = ['📦 消息基本信息', `Real Seq: ${realSeq}`];
  if (senderQQ) infoParts.push(`发送者QQ: ${senderQQ}`);
  if (senderName) infoParts.push(`发送者昵称: ${senderName}`);
  nodes.push({ type: 'node', data: { user_id: botId, nickname: botName, content: [{ type: 'text', data: { text: infoParts.join('\n') } }] } });

  const bodyData = extractBodyData(pbData);

  if (packetMode === 1) {
    if (onebotData) { nodes.push(createFlatNode(botId, '📋', 'OneBot 数据')); nodes.push(createFlatNode(botId, '📋', JSON.stringify(onebotData, null, 2))); }
    if (bodyData) { nodes.push(createFlatNode(botId, '📦', 'Body 数据')); nodes.push(createFlatNode(botId, '📦', jsonDumpsWithBytes(bodyData))); }
    nodes.push(createFlatNode(botId, '🔍', 'ProtoBuf 数据'));
    nodes.push(createFlatNode(botId, '🔍', jsonDumpsWithBytes(pbData)));
  } else {
    if (onebotData) nodes.push(createNestedNode(botId, '📋 OneBot 数据', 'OneBot 标准格式的消息数据', JSON.stringify(onebotData, null, 2)));
    if (bodyData) nodes.push(createNestedNode(botId, '📦 Body 数据', 'Body 数据', jsonDumpsWithBytes(bodyData)));
    nodes.push(createNestedNode(botId, '🔍 ProtoBuf 数据', 'ProtoBuf 数据', jsonDumpsWithBytes(pbData)));
  }
  return nodes;
}

export { jsonDumpsWithBytes };
