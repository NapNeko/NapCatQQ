export const GuildActionsExamples = {
  GetGuildList: {
    payload: {},
    response: [{ guild_id: '123456', guild_name: '测试频道' }],
  },
  GetGuildProfile: {
    payload: { guild_id: '123456' },
    response: { guild_id: '123456', guild_name: '测试频道', guild_display_id: '123' },
  },
};
