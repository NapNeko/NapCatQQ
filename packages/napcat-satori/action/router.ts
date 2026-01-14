/**
 * Satori Action 名称映射
 */
export const SatoriActionName = {
  // 消息相关
  MessageCreate: 'message.create',
  MessageGet: 'message.get',
  MessageDelete: 'message.delete',
  MessageUpdate: 'message.update',
  MessageList: 'message.list',

  // 频道相关
  ChannelGet: 'channel.get',
  ChannelList: 'channel.list',
  ChannelCreate: 'channel.create',
  ChannelUpdate: 'channel.update',
  ChannelDelete: 'channel.delete',
  ChannelMute: 'channel.mute',

  // 群组/公会相关
  GuildGet: 'guild.get',
  GuildList: 'guild.list',
  GuildApprove: 'guild.approve',

  // 群成员相关
  GuildMemberGet: 'guild.member.get',
  GuildMemberList: 'guild.member.list',
  GuildMemberKick: 'guild.member.kick',
  GuildMemberMute: 'guild.member.mute',
  GuildMemberApprove: 'guild.member.approve',
  GuildMemberRole: 'guild.member.role',

  // 角色相关
  GuildRoleList: 'guild.role.list',
  GuildRoleCreate: 'guild.role.create',
  GuildRoleUpdate: 'guild.role.update',
  GuildRoleDelete: 'guild.role.delete',

  // 用户相关
  UserGet: 'user.get',
  UserChannelCreate: 'user.channel.create',

  // 好友相关
  FriendList: 'friend.list',
  FriendApprove: 'friend.approve',

  // 登录相关
  LoginGet: 'login.get',

  // 上传相关
  UploadCreate: 'upload.create',

  // 内部互操作（Satori 可选）
  InternalAction: 'internal.action',
} as const;

export type SatoriActionNameType = typeof SatoriActionName[keyof typeof SatoriActionName];
