import { Type, Static } from '@sinclair/typebox';
import Ajv from 'ajv';

// Satori WebSocket 服务器配置
const SatoriWebSocketServerConfigSchema = Type.Object({
  name: Type.String({ default: 'satori-ws-server' }),
  enable: Type.Boolean({ default: false }),
  host: Type.String({ default: '127.0.0.1' }),
  port: Type.Number({ default: 5500 }),
  token: Type.String({ default: '' }),
  path: Type.String({ default: '/v1/events' }),
  debug: Type.Boolean({ default: false }),
  heartInterval: Type.Number({ default: 10000 }),
});

// Satori WebHook 客户端配置
const SatoriWebHookClientConfigSchema = Type.Object({
  name: Type.String({ default: 'satori-webhook-client' }),
  enable: Type.Boolean({ default: false }),
  url: Type.String({ default: 'http://localhost:8080/webhook' }),
  token: Type.String({ default: '' }),
  debug: Type.Boolean({ default: false }),
});

// Satori HTTP 服务器配置
const SatoriHttpServerConfigSchema = Type.Object({
  name: Type.String({ default: 'satori-http-server' }),
  enable: Type.Boolean({ default: false }),
  host: Type.String({ default: '127.0.0.1' }),
  port: Type.Number({ default: 5501 }),
  token: Type.String({ default: '' }),
  path: Type.String({ default: '/v1' }),
  debug: Type.Boolean({ default: false }),
});

// Satori 网络配置
const SatoriNetworkConfigSchema = Type.Object({
  websocketServers: Type.Array(SatoriWebSocketServerConfigSchema, { default: [] }),
  webhookClients: Type.Array(SatoriWebHookClientConfigSchema, { default: [] }),
  httpServers: Type.Array(SatoriHttpServerConfigSchema, { default: [] }),
}, { default: {} });

// Satori 协议配置
export const SatoriConfigSchema = Type.Object({
  network: SatoriNetworkConfigSchema,
  platform: Type.String({ default: 'qq' }),
  selfId: Type.String({ default: '' }),
});

export type SatoriConfig = Static<typeof SatoriConfigSchema>;
export type SatoriWebSocketServerConfig = Static<typeof SatoriWebSocketServerConfigSchema>;
export type SatoriWebHookClientConfig = Static<typeof SatoriWebHookClientConfigSchema>;
export type SatoriHttpServerConfig = Static<typeof SatoriHttpServerConfigSchema>;
export type SatoriNetworkAdapterConfig = SatoriWebSocketServerConfig | SatoriWebHookClientConfig | SatoriHttpServerConfig;
export type SatoriNetworkConfigKey = keyof SatoriConfig['network'];

export function loadSatoriConfig (config: Partial<SatoriConfig>): SatoriConfig {
  const ajv = new Ajv({ useDefaults: true, coerceTypes: true });
  const validate = ajv.compile(SatoriConfigSchema);
  const valid = validate(config);
  if (!valid) {
    throw new Error(ajv.errorsText(validate.errors));
  }
  return config as SatoriConfig;
}
