export const SystemActionsExamples = {
  CanSendImage: {
    payload: {},
    response: { yes: true },
  },
  CanSendRecord: {
    payload: {},
    response: { yes: true },
  },
  CleanCache: {
    payload: {},
    response: {},
  },
  GetCredentials: {
    payload: {},
    response: { cookies: '...', csrf_token: 123456789 },
  },
  GetCSRF: {
    payload: {},
    response: { token: 123456789 },
  },
  GetLoginInfo: {
    payload: {},
    response: { user_id: 123456789, nickname: '机器人' },
  },
  GetStatus: {
    payload: {},
    response: { online: true, good: true },
  },
  GetSystemMsg: {
    payload: {},
    response: { invited_requests: [], join_requests: [] },
  },
  GetVersionInfo: {
    payload: {},
    response: { app_name: 'NapCatQQ', app_version: '1.0.0', protocol_version: 'v11' },
  },
  SetRestart: {
    payload: { delay: 0 },
    response: {},
  },
};
