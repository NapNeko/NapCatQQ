interface WebUIConfig {
  background: string
  musicListID: string
  customIcons: Record<string, string>
}

interface IConfig {
  onebot: OneBotConfig
  webui: WebUIConfig
}
