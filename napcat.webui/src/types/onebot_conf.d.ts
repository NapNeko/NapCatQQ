interface AdapterConfigInner {
  name: string
  enable: boolean
  debug: boolean
  token: string
}

interface AdapterConfig extends AdapterConfigInner {
  [key: string]: string | boolean | number
}

type MessageFormat = 'array' | 'string'

interface HttpServerConfig extends AdapterConfig {
  port: number
  host: string
  enableCors: boolean
  enableWebsocket: boolean
  messagePostFormat: MessageFormat
}

interface HttpClientConfig extends AdapterConfig {
  url: string
  messagePostFormat: MessageFormat
  reportSelfMessage: boolean
}

interface WebsocketServerConfig extends AdapterConfig {
  host: string
  port: number
  messagePostFormat: MessageFormat
  reportSelfMessage: boolean
  enableForcePushEvent: boolean
  heartInterval: number
}

interface WebsocketClientConfig extends AdapterConfig {
  url: string
  messagePostFormat: MessageFormat
  reportSelfMessage: boolean
  reconnectInterval: number
  token: string
  debug: boolean
  heartInterval: number
}

interface HttpSseServerConfig extends HttpServerConfig {
  reportSelfMessage: boolean
}

interface NetworkConfig {
  httpServers: Array<HttpServerConfig>
  httpClients: Array<HttpClientConfig>
  httpSseServers: Array<HttpSseServerConfig>
  websocketServers: Array<WebsocketServerConfig>
  websocketClients: Array<WebsocketClientConfig>
}

interface OneBotConfig {
  network: NetworkConfig // 网络配置
  musicSignUrl: string // 音乐签名地址
  enableLocalFile2Url: boolean
  parseMultMsg: boolean
}
