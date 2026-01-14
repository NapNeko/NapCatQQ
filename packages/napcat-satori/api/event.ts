import { NapCatCore, RawMessage, ChatType, GroupNotify, FriendRequest } from 'napcat-core';
import { NapCatSatoriAdapter } from '../index';
import {
  SatoriEvent,
  SatoriChannelType,
  SatoriLoginStatus,
} from '../types';

/**
 * Satori 事件类型定义
 */
export const SatoriEventType = {
  // 消息事件
  MESSAGE_CREATED: 'message-created',
  MESSAGE_UPDATED: 'message-updated',
  MESSAGE_DELETED: 'message-deleted',

  // 频道事件
  CHANNEL_CREATED: 'channel-created',
  CHANNEL_UPDATED: 'channel-updated',
  CHANNEL_DELETED: 'channel-deleted',

  // 群组/公会事件
  GUILD_ADDED: 'guild-added',
  GUILD_UPDATED: 'guild-updated',
  GUILD_REMOVED: 'guild-removed',
  GUILD_REQUEST: 'guild-request',

  // 群成员事件
  GUILD_MEMBER_ADDED: 'guild-member-added',
  GUILD_MEMBER_UPDATED: 'guild-member-updated',
  GUILD_MEMBER_REMOVED: 'guild-member-removed',
  GUILD_MEMBER_REQUEST: 'guild-member-request',

  // 角色事件
  GUILD_ROLE_CREATED: 'guild-role-created',
  GUILD_ROLE_UPDATED: 'guild-role-updated',
  GUILD_ROLE_DELETED: 'guild-role-deleted',

  // 好友事件
  FRIEND_REQUEST: 'friend-request',

  // 登录事件
  LOGIN_ADDED: 'login-added',
  LOGIN_REMOVED: 'login-removed',
  LOGIN_UPDATED: 'login-updated',

  // 内部事件
  INTERNAL: 'internal',
} as const;

export type SatoriEventTypeName = typeof SatoriEventType[keyof typeof SatoriEventType];

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
   * 创建基础事件结构
   */
  private createBaseEvent (type: SatoriEventTypeName): SatoriEvent {
    return {
      id: this.getNextEventId(),
      type,
      platform: this.platform,
      self_id: this.selfId,
      timestamp: Date.now(),
    };
  }

  /**
   * 将 NapCat 消息转换为 Satori 事件
   */
  async createMessageEvent (message: RawMessage): Promise<SatoriEvent | null> {
    try {
      const content = await this.satoriAdapter.apis.MsgApi.parseElements(message.elements);
      const isPrivate = message.chatType === ChatType.KCHATTYPEC2C;

      const event = this.createBaseEvent(SatoriEventType.MESSAGE_CREATED);
      event.timestamp = parseInt(message.msgTime) * 1000;
      event.channel = {
        id: isPrivate ? `private:${message.senderUin}` : `group:${message.peerUin}`,
        type: isPrivate ? SatoriChannelType.DIRECT : SatoriChannelType.TEXT,
      };
      event.user = {
        id: message.senderUin,
        name: message.sendNickName,
        avatar: `https://q1.qlogo.cn/g?b=qq&nk=${message.senderUin}&s=640`,
      };
      event.message = {
        id: message.msgId,
        content,
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
   * 创建消息更新事件
   */
  async createMessageUpdatedEvent (message: RawMessage): Promise<SatoriEvent | null> {
    try {
      const content = await this.satoriAdapter.apis.MsgApi.parseElements(message.elements);
      const isPrivate = message.chatType === ChatType.KCHATTYPEC2C;

      const event = this.createBaseEvent(SatoriEventType.MESSAGE_UPDATED);
      event.channel = {
        id: isPrivate ? `private:${message.senderUin}` : `group:${message.peerUin}`,
        type: isPrivate ? SatoriChannelType.DIRECT : SatoriChannelType.TEXT,
      };
      event.user = {
        id: message.senderUin,
        name: message.sendNickName,
        avatar: `https://q1.qlogo.cn/g?b=qq&nk=${message.senderUin}&s=640`,
      };
      event.message = {
        id: message.msgId,
        content,
      };

      return event;
    } catch (error) {
      this.core.context.logger.logError('[Satori] 创建消息更新事件失败:', error);
      return null;
    }
  }

  /**
   * 创建好友请求事件
   */
  createFriendRequestEvent (request: FriendRequest): SatoriEvent {
    const event = this.createBaseEvent(SatoriEventType.FRIEND_REQUEST);
    event.user = {
      id: request.friendUid,
      name: request.friendNick,
      avatar: `https://q1.qlogo.cn/g?b=qq&nk=${request.friendUid}&s=640`,
    };
    event.message = {
      id: request.reqTime,
      content: request.extWords,
    };
    return event;
  }

  /**
   * 创建群组加入请求事件
   */
  createGuildMemberRequestEvent (notify: GroupNotify): SatoriEvent {
    const event = this.createBaseEvent(SatoriEventType.GUILD_MEMBER_REQUEST);
    event.guild = {
      id: notify.group.groupCode,
      name: notify.group.groupName,
      avatar: `https://p.qlogo.cn/gh/${notify.group.groupCode}/${notify.group.groupCode}/640`,
    };
    event.user = {
      id: notify.user1.uid,
      name: notify.user1.nickName,
      avatar: `https://q1.qlogo.cn/g?b=qq&nk=${notify.user1.uid}&s=640`,
    };
    event.message = {
      id: notify.seq,
      content: notify.postscript,
    };
    return event;
  }

  /**
   * 创建群组邀请事件
   */
  createGuildRequestEvent (notify: GroupNotify): SatoriEvent {
    const event = this.createBaseEvent(SatoriEventType.GUILD_REQUEST);
    event.guild = {
      id: notify.group.groupCode,
      name: notify.group.groupName,
      avatar: `https://p.qlogo.cn/gh/${notify.group.groupCode}/${notify.group.groupCode}/640`,
    };
    event.user = {
      id: notify.user2.uid,
      name: notify.user2.nickName,
      avatar: `https://q1.qlogo.cn/g?b=qq&nk=${notify.user2.uid}&s=640`,
    };
    event.message = {
      id: notify.seq,
      content: notify.postscript,
    };
    return event;
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
    const event = this.createBaseEvent(SatoriEventType.GUILD_MEMBER_ADDED);
    event.guild = {
      id: guildId,
      name: guildName,
      avatar: `https://p.qlogo.cn/gh/${guildId}/${guildId}/640`,
    };
    event.user = {
      id: userId,
      name: userName,
      avatar: `https://q1.qlogo.cn/g?b=qq&nk=${userId}&s=640`,
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
    const event = this.createBaseEvent(SatoriEventType.GUILD_MEMBER_REMOVED);
    event.guild = {
      id: guildId,
      name: guildName,
      avatar: `https://p.qlogo.cn/gh/${guildId}/${guildId}/640`,
    };
    event.user = {
      id: userId,
      name: userName,
      avatar: `https://q1.qlogo.cn/g?b=qq&nk=${userId}&s=640`,
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
   * 创建群添加事件（自己被邀请或加入群）
   */
  createGuildAddedEvent (
    guildId: string,
    guildName: string
  ): SatoriEvent {
    const event = this.createBaseEvent(SatoriEventType.GUILD_ADDED);
    event.guild = {
      id: guildId,
      name: guildName,
      avatar: `https://p.qlogo.cn/gh/${guildId}/${guildId}/640`,
    };
    return event;
  }

  /**
   * 创建群移除事件（被踢出或退出群）
   */
  createGuildRemovedEvent (
    guildId: string,
    guildName: string
  ): SatoriEvent {
    const event = this.createBaseEvent(SatoriEventType.GUILD_REMOVED);
    event.guild = {
      id: guildId,
      name: guildName,
      avatar: `https://p.qlogo.cn/gh/${guildId}/${guildId}/640`,
    };
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
    const event = this.createBaseEvent(SatoriEventType.MESSAGE_DELETED);
    event.channel = {
      id: channelId,
      type: isPrivate ? SatoriChannelType.DIRECT : SatoriChannelType.TEXT,
    };
    event.user = {
      id: userId,
      avatar: `https://q1.qlogo.cn/g?b=qq&nk=${userId}&s=640`,
    };
    event.message = {
      id: messageId,
      content: '',
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
   * 创建登录添加事件
   */
  createLoginAddedEvent (): SatoriEvent {
    const event = this.createBaseEvent(SatoriEventType.LOGIN_ADDED);
    event.login = {
      user: {
        id: this.selfId,
        name: this.core.selfInfo.nick,
        avatar: `https://q1.qlogo.cn/g?b=qq&nk=${this.selfId}&s=640`,
      },
      self_id: this.selfId,
      platform: this.platform,
      status: SatoriLoginStatus.ONLINE,
    };
    return event;
  }

  /**
   * 创建登录移除事件
   */
  createLoginRemovedEvent (): SatoriEvent {
    const event = this.createBaseEvent(SatoriEventType.LOGIN_REMOVED);
    event.login = {
      user: {
        id: this.selfId,
        name: this.core.selfInfo.nick,
        avatar: `https://q1.qlogo.cn/g?b=qq&nk=${this.selfId}&s=640`,
      },
      self_id: this.selfId,
      platform: this.platform,
      status: SatoriLoginStatus.OFFLINE,
    };
    return event;
  }

  /**
   * 创建登录状态更新事件
   */
  createLoginUpdatedEvent (status: SatoriLoginStatus): SatoriEvent {
    const event = this.createBaseEvent(SatoriEventType.LOGIN_UPDATED);
    event.login = {
      user: {
        id: this.selfId,
        name: this.core.selfInfo.nick,
        avatar: `https://q1.qlogo.cn/g?b=qq&nk=${this.selfId}&s=640`,
      },
      self_id: this.selfId,
      platform: this.platform,
      status,
    };
    return event;
  }

  /**
   * 创建内部事件（用于扩展）
   */
  createInternalEvent (typeName: string, data: Record<string, unknown>): SatoriEvent {
    const event = this.createBaseEvent(SatoriEventType.INTERNAL);
    event._type = typeName;
    event._data = data;
    return event;
  }
}

export { SatoriEventType as EventType };
