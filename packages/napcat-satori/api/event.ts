import { NapCatCore, RawMessage, ChatType } from 'napcat-core';
import { NapCatSatoriAdapter } from '@/napcat-satori/index';
import {
  SatoriEvent,
  SatoriChannelType,
  SatoriLoginStatus,
} from '@/napcat-satori/types';

export class SatoriEventApi {
  private satoriAdapter: NapCatSatoriAdapter;
  private core: NapCatCore;
  private eventId: number = 0;

  constructor (satoriAdapter: NapCatSatoriAdapter, core: NapCatCore) {
    this.satoriAdapter = satoriAdapter;
    this.core = core;
  }

  private getNextEventId (): number {
    return ++this.eventId;
  }

  private get platform (): string {
    return this.satoriAdapter.configLoader.configData.platform;
  }

  private get selfId (): string {
    return this.core.selfInfo.uin;
  }

  /**
   * 将 NapCat 消息转换为 Satori 事件
   */
  async createMessageEvent (message: RawMessage): Promise<SatoriEvent | null> {
    try {
      const content = await this.satoriAdapter.apis.MsgApi.parseElements(message.elements);
      const isPrivate = message.chatType === ChatType.KCHATTYPEC2C;

      const event: SatoriEvent = {
        id: this.getNextEventId(),
        type: 'message-created',
        platform: this.platform,
        self_id: this.selfId,
        timestamp: parseInt(message.msgTime) * 1000,
        channel: {
          id: isPrivate ? `private:${message.senderUin}` : `group:${message.peerUin}`,
          type: isPrivate ? SatoriChannelType.DIRECT : SatoriChannelType.TEXT,
        },
        user: {
          id: message.senderUin,
          name: message.sendNickName,
          avatar: `https://q1.qlogo.cn/g?b=qq&nk=${message.senderUin}&s=640`,
        },
        message: {
          id: message.msgId,
          content,
        },
      };

      if (!isPrivate) {
        event.guild = {
          id: message.peerUin,
          name: message.peerName,
          avatar: `https://p.qlogo.cn/gh/${message.peerUin}/${message.peerUin}/640`,
        };
        event.member = {
          nick: message.sendMemberName || message.sendNickName,
        };
      }

      return event;
    } catch (error) {
      this.core.context.logger.logError('[Satori] 创建消息事件失败:', error);
      return null;
    }
  }

  /**
   * 创建好友请求事件
   */
  createFriendRequestEvent (
    userId: string,
    userName: string,
    comment: string,
    flag: string
  ): SatoriEvent {
    return {
      id: this.getNextEventId(),
      type: 'friend-request',
      platform: this.platform,
      self_id: this.selfId,
      timestamp: Date.now(),
      user: {
        id: userId,
        name: userName,
        avatar: `https://q1.qlogo.cn/g?b=qq&nk=${userId}&s=640`,
      },
      message: {
        id: flag,
        content: comment,
      },
    };
  }

  /**
   * 创建群组加入请求事件
   */
  createGuildMemberRequestEvent (
    guildId: string,
    guildName: string,
    userId: string,
    userName: string,
    comment: string,
    flag: string
  ): SatoriEvent {
    return {
      id: this.getNextEventId(),
      type: 'guild-member-request',
      platform: this.platform,
      self_id: this.selfId,
      timestamp: Date.now(),
      guild: {
        id: guildId,
        name: guildName,
        avatar: `https://p.qlogo.cn/gh/${guildId}/${guildId}/640`,
      },
      user: {
        id: userId,
        name: userName,
        avatar: `https://q1.qlogo.cn/g?b=qq&nk=${userId}&s=640`,
      },
      message: {
        id: flag,
        content: comment,
      },
    };
  }

  /**
   * 创建群成员增加事件
   */
  createGuildMemberAddedEvent (
    guildId: string,
    guildName: string,
    userId: string,
    userName: string,
    operatorId?: string
  ): SatoriEvent {
    const event: SatoriEvent = {
      id: this.getNextEventId(),
      type: 'guild-member-added',
      platform: this.platform,
      self_id: this.selfId,
      timestamp: Date.now(),
      guild: {
        id: guildId,
        name: guildName,
        avatar: `https://p.qlogo.cn/gh/${guildId}/${guildId}/640`,
      },
      user: {
        id: userId,
        name: userName,
        avatar: `https://q1.qlogo.cn/g?b=qq&nk=${userId}&s=640`,
      },
    };

    if (operatorId) {
      event.operator = {
        id: operatorId,
        avatar: `https://q1.qlogo.cn/g?b=qq&nk=${operatorId}&s=640`,
      };
    }

    return event;
  }

  /**
   * 创建群成员移除事件
   */
  createGuildMemberRemovedEvent (
    guildId: string,
    guildName: string,
    userId: string,
    userName: string,
    operatorId?: string
  ): SatoriEvent {
    const event: SatoriEvent = {
      id: this.getNextEventId(),
      type: 'guild-member-removed',
      platform: this.platform,
      self_id: this.selfId,
      timestamp: Date.now(),
      guild: {
        id: guildId,
        name: guildName,
        avatar: `https://p.qlogo.cn/gh/${guildId}/${guildId}/640`,
      },
      user: {
        id: userId,
        name: userName,
        avatar: `https://q1.qlogo.cn/g?b=qq&nk=${userId}&s=640`,
      },
    };

    if (operatorId) {
      event.operator = {
        id: operatorId,
        avatar: `https://q1.qlogo.cn/g?b=qq&nk=${operatorId}&s=640`,
      };
    }

    return event;
  }

  /**
   * 创建消息删除事件
   */
  createMessageDeletedEvent (
    channelId: string,
    messageId: string,
    userId: string,
    operatorId?: string
  ): SatoriEvent {
    const isPrivate = channelId.startsWith('private:');
    const event: SatoriEvent = {
      id: this.getNextEventId(),
      type: 'message-deleted',
      platform: this.platform,
      self_id: this.selfId,
      timestamp: Date.now(),
      channel: {
        id: channelId,
        type: isPrivate ? SatoriChannelType.DIRECT : SatoriChannelType.TEXT,
      },
      user: {
        id: userId,
        avatar: `https://q1.qlogo.cn/g?b=qq&nk=${userId}&s=640`,
      },
      message: {
        id: messageId,
        content: '',
      },
    };

    if (operatorId) {
      event.operator = {
        id: operatorId,
        avatar: `https://q1.qlogo.cn/g?b=qq&nk=${operatorId}&s=640`,
      };
    }

    return event;
  }

  /**
   * 创建登录状态更新事件
   */
  createLoginUpdatedEvent (status: SatoriLoginStatus): SatoriEvent {
    return {
      id: this.getNextEventId(),
      type: 'login-updated',
      platform: this.platform,
      self_id: this.selfId,
      timestamp: Date.now(),
      login: {
        user: {
          id: this.selfId,
          name: this.core.selfInfo.nick,
          avatar: `https://q1.qlogo.cn/g?b=qq&nk=${this.selfId}&s=640`,
        },
        self_id: this.selfId,
        platform: this.platform,
        status,
      },
    };
  }
}
