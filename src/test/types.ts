export interface INapCatConfig {
  account: INapCatConfigAccount,
  heartbeat: INapCatConfigHeartbeat,
  adapters: Record<string, INapCatConfigAdapterBase>,
  log: INapCatConfigLog,
}

export interface INapCatConfigAccount {
  uin: string,
  password?: string,
  noQuickLogin?: boolean,
}

export interface INapCatConfigHeartbeat {
  interval: number,
}

export interface INapCatConfigLog {
  level: string,
}

export interface INapCatConfigAdapterBase {
  address: string,
  port: number,
  accessToken?: string,
}