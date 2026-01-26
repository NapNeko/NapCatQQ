export const PacketActionsExamples = {
  GetPacketStatus: {
    payload: {},
    response: { status: 'ok' },
  },
  SendPoke: {
    payload: { user_id: '123456789' },
    response: {},
  },
  SetGroupTodo: {
    payload: { group_id: '123456', message_id: '123456789' },
    response: {},
  },
};
