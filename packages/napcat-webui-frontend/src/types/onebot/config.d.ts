interface WebUIConfig {
  background: string
  musicListID: string
  customIcons: Record<string, string>
  host: string
  port: number
  loginRate: number
  disableWebUI: boolean
  accessControlMode: 'none' | 'whitelist' | 'blacklist'
  ipWhitelist: string[]
  ipBlacklist: string[]
  enableXForwardedFor: boolean
  hitokotoApi: string
}

interface IConfig {
  onebot: OneBotConfig
  webui: WebUIConfig
}
