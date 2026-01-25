import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { OB11Message, OB11MessageData, OB11MessageDataType, OB11MessageForward, OB11MessageNodePlain as OB11MessageNode } from '@/napcat-onebot/index';
import { ActionName } from '@/napcat-onebot/action/router';
import { MessageUnique } from 'napcat-common/src/message-unique';
import { Static, Type } from '@sinclair/typebox';
import { ChatType, ElementType, MsgSourceType, NTMsgType, RawMessage } from 'napcat-core';
import { isNumeric } from 'napcat-common/src/helper';

const PayloadSchema = Type.Object({
  message_id: Type.Optional(Type.String({ description: '消息ID' })),
  id: Type.Optional(Type.String({ description: '消息ID' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  messages: Type.Optional(Type.Array(Type.Unknown(), { description: '消息列表' })),
}, { description: '合并转发消息' });

type ReturnType = Static<typeof ReturnSchema>;

function isForward (msg: OB11MessageData | string): msg is OB11MessageForward {
  return typeof msg !== 'string' && msg.type === OB11MessageDataType.forward;
}

export class GoCQHTTPGetForwardMsgAction extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GoCQHTTP_GetForwardMsg;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  private createTemplateNode (message: OB11Message): OB11MessageNode {
    return {
      type: OB11MessageDataType.node,
      data: {
        user_id: message.user_id,
        nickname: message.sender.nickname,
        message: [],
        content: [],
      },
    };
  }

  async parseForward (messages: OB11Message[]): Promise<OB11MessageNode[]> {
    const retMsg: OB11MessageNode[] = [];

    for (const message of messages) {
      const templateNode = this.createTemplateNode(message);

      for (const msgdata of message.message) {
        if (isForward(msgdata)) {
          const newNode = this.createTemplateNode(message);
          newNode.data.message = await this.parseForward(msgdata.data.content ?? []);

          templateNode.data.message.push(newNode);
        } else {
          if (typeof msgdata === 'string') {
            const textMsg: OB11MessageData = { type: OB11MessageDataType.text, data: { text: msgdata } };
            templateNode.data.message.push(textMsg);
          } else {
            templateNode.data.message.push(msgdata);
          }
        }
      }
      retMsg.push(templateNode);
    }

    return retMsg;
  }

  async _handle (payload: PayloadType) {
    // 1. 检查消息ID是否存在
    const msgId = payload.message_id || payload.id;
    if (!msgId) {
      throw new Error('message_id is required');
    }

    // 2. 定义辅助函数 - 创建伪转发消息对象
    const createFakeForwardMsg = (resId: string): RawMessage => {
      const fakeMsg: RawMessage = {
        chatType: ChatType.KCHATTYPEGROUP,
        elements: [{
          elementType: ElementType.MULTIFORWARD,
          elementId: '',
          multiForwardMsgElement: {
            resId,
            fileName: '',
            xmlContent: '',
          },
        }],
        guildId: '',
        isOnlineMsg: false,
        msgId: '', // TODO: no necessary
        msgRandom: '0',
        msgSeq: '',
        msgTime: '',
        msgType: NTMsgType.KMSGTYPEMIX,
        parentMsgIdList: [],
        parentMsgPeer: {
          chatType: ChatType.KCHATTYPEGROUP,
          peerUid: '',
        },
        peerName: '',
        peerUid: '284840486',
        peerUin: '284840486',
        recallTime: '0',
        records: [],
        sendNickName: '',
        sendRemarkName: '',
        senderUid: '',
        senderUin: '1094950020',
        sourceType: MsgSourceType.K_DOWN_SOURCETYPE_UNKNOWN,
        subMsgType: 1,
      };
      return fakeMsg;
    };

    // 3. 定义协议回退逻辑函数
    const protocolFallbackLogic = async (resId: string) => {
      const ob = (await this.obContext.apis.MsgApi.parseMessageV2(createFakeForwardMsg(resId), true))?.arrayMsg;
      const firstMsg = ob?.message?.[0];
      if (firstMsg && isForward(firstMsg)) {
        return {
          messages: firstMsg.data.content,
        };
      }
      throw new Error('protocolFallbackLogic: 找不到相关的聊天记录');
    };
    // 4. 尝试通过正常渠道获取消息
    // 如果是数字ID，优先使用getMsgsByMsgId获取
    if (!isNumeric(msgId)) {
      const ret = await protocolFallbackLogic(msgId);
      if (ret.messages) {
        return ret;
      }
      throw new Error('ResId无效: 找不到相关的聊天记录');
    }
    const rootMsgId = MessageUnique.getShortIdByMsgId(msgId.toString());
    const rootMsg = MessageUnique.getMsgIdAndPeerByShortId(rootMsgId ?? +msgId);

    if (rootMsg) {
      // 5. 获取消息内容
      const data = await this.core.apis.MsgApi.getMsgHistory(rootMsg.Peer, rootMsg.MsgId, 1);//getMsgsIncludeSelf

      if (data && data.result === 0 && data.msgList.length > 0) {
        const singleMsg = data.msgList[0];
        if (!singleMsg) {
          throw new Error('消息不存在或已过期');
        }
        // 6. 解析消息内容
        const resMsg = (await this.obContext.apis.MsgApi.parseMessage(singleMsg, 'array', true));

        const firstMsg = resMsg?.message?.[0];
        if (firstMsg && isForward(firstMsg)) {
          const forwardContent = firstMsg.data.content;
          if (forwardContent) {
            return { messages: forwardContent };
          }
        }
      }
    }
    // 说明消息已过期或者为内层消息 NapCat 一次返回不处理内层消息
    throw new Error('消息已过期或者为内层消息，无法获取转发消息');
  }
}
