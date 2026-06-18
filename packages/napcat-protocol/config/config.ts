import { Type, Static } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { Value } from '@sinclair/typebox/value';

// WebSocket 服务端配置
const WebsocketServerConfigSchema = Type.Object({
  name: Type.String({ default: 'napcat-ws-server' }),
  enable: Type.Boolean({ default: false }),
  host: Type.String({ default: '127.0.0.1' }),
  port: Type.Number({ default: 6700 }),
  token: Type.String({ default: '' }),
  heartInterval: Type.Number({ default: 30000 }),
  debug: Type.Boolean({ default: false }),
});

// WebSocket 客户端配置
const WebsocketClientConfigSchema = Type.Object({
  name: Type.String({ default: 'napcat-ws-client' }),
  enable: Type.Boolean({ default: false }),
  url: Type.String({ default: 'ws://localhost:6701' }),
  token: Type.String({ default: '' }),
  reconnectInterval: Type.Number({ default: 5000 }),
  heartInterval: Type.Number({ default: 30000 }),
  debug: Type.Boolean({ default: false }),
});

// HTTP 服务端配置
const HttpServerConfigSchema = Type.Object({
  name: Type.String({ default: 'napcat-http-server' }),
  enable: Type.Boolean({ default: false }),
  host: Type.String({ default: '127.0.0.1' }),
  port: Type.Number({ default: 6702 }),
  token: Type.String({ default: '' }),
  enableCors: Type.Boolean({ default: true }),
  debug: Type.Boolean({ default: false }),
});

// 网络配置
const NetworkConfigSchema = Type.Object({
  httpServers: Type.Array(HttpServerConfigSchema, { default: [] }),
  websocketServers: Type.Array(WebsocketServerConfigSchema, { default: [] }),
  websocketClients: Type.Array(WebsocketClientConfigSchema, { default: [] }),
}, { default: {} });

// NapCat Protocol 主配置 - 默认关闭
export const NapCatProtocolConfigSchema = Type.Object({
  enable: Type.Boolean({ default: false }), // 默认关闭
  network: NetworkConfigSchema,
});

export type NapCatProtocolConfig = Static<typeof NapCatProtocolConfigSchema>;
export type HttpServerConfig = Static<typeof HttpServerConfigSchema>;
export type WebsocketServerConfig = Static<typeof WebsocketServerConfigSchema>;
export type WebsocketClientConfig = Static<typeof WebsocketClientConfigSchema>;

export type NetworkAdapterConfig = HttpServerConfig | WebsocketServerConfig | WebsocketClientConfig;
export type NetworkConfigKey = keyof NapCatProtocolConfig['network'];

export function loadConfig (config: Partial<NapCatProtocolConfig>): NapCatProtocolConfig {
  let data = config;
  data = Value.Parse(NapCatProtocolConfigSchema, data) as Partial<NapCatProtocolConfig>;
  const validate = TypeCompiler.Compile(NapCatProtocolConfigSchema);
  const valid = validate.Check(data);
  if (!valid) {
    const errorMsg = [...validate.Errors(data)].map(e => e.message).join(', ');
    throw new Error(errorMsg);
  }
  return data as NapCatProtocolConfig;
}
