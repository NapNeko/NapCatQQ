import { NapCatCore } from 'napcat-core';
import { NapCatSatoriAdapter } from '@/napcat-satori/index';
import { SatoriAction } from './SatoriAction';

// 导入所有 Action
import { MessageCreateAction } from './message/MessageCreate';
import { MessageGetAction } from './message/MessageGet';
import { MessageDeleteAction } from './message/MessageDelete';
import { ChannelGetAction } from './channel/ChannelGet';
import { ChannelListAction } from './channel/ChannelList';
import { GuildGetAction } from './guild/GuildGet';
import { GuildListAction } from './guild/GuildList';
import { GuildMemberGetAction } from './guild/GuildMemberGet';
import { GuildMemberListAction } from './guild/GuildMemberList';
import { GuildMemberKickAction } from './guild/GuildMemberKick';
import { GuildMemberMuteAction } from './guild/GuildMemberMute';
import { UserGetAction } from './user/UserGet';
import { FriendListAction } from './user/FriendList';
import { FriendApproveAction } from './user/FriendApprove';
import { UploadCreateAction } from './upload/UploadCreate';

export type SatoriActionMap = Map<string, SatoriAction<unknown, unknown>>;

export function createSatoriActionMap (
  satoriAdapter: NapCatSatoriAdapter,
  core: NapCatCore
): SatoriActionMap {
  const actionMap: SatoriActionMap = new Map();

  const actions: SatoriAction<unknown, unknown>[] = [
    // 消息相关
    new MessageCreateAction(satoriAdapter, core),
    new MessageGetAction(satoriAdapter, core),
    new MessageDeleteAction(satoriAdapter, core),
    // 频道相关
    new ChannelGetAction(satoriAdapter, core),
    new ChannelListAction(satoriAdapter, core),
    // 群组相关
    new GuildGetAction(satoriAdapter, core),
    new GuildListAction(satoriAdapter, core),
    new GuildMemberGetAction(satoriAdapter, core),
    new GuildMemberListAction(satoriAdapter, core),
    new GuildMemberKickAction(satoriAdapter, core),
    new GuildMemberMuteAction(satoriAdapter, core),
    // 用户相关
    new UserGetAction(satoriAdapter, core),
    new FriendListAction(satoriAdapter, core),
    new FriendApproveAction(satoriAdapter, core),
    // 上传相关
    new UploadCreateAction(satoriAdapter, core),
  ];

  for (const action of actions) {
    actionMap.set(action.actionName, action);
  }

  return actionMap;
}

export { SatoriAction } from './SatoriAction';
