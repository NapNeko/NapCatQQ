import { Type, Static } from '@sinclair/typebox';
import Ajv from 'ajv';

const HttpServerConfigSchema = Type.Object({
    name: Type.String({ default: 'http-server' }),
    enable: Type.Boolean({ default: false }),
    port: Type.Number({ default: 3000 }),
    host: Type.String({ default: '0.0.0.0' }),
    enableCors: Type.Boolean({ default: true }),
    enableWebsocket: Type.Boolean({ default: true }),
    messagePostFormat: Type.String({ default: 'array' }),
    token: Type.String({ default: '' }),
    debug: Type.Boolean({ default: false })
});

const HttpSseServerConfigSchema = Type.Object({
    name: Type.String({ default: 'http-sse-server' }),
    enable: Type.Boolean({ default: false }),
    port: Type.Number({ default: 3000 }),
    host: Type.String({ default: '0.0.0.0' }),
    enableCors: Type.Boolean({ default: true }),
    enableWebsocket: Type.Boolean({ default: true }),
    messagePostFormat: Type.String({ default: 'array' }),
    token: Type.String({ default: '' }),
    debug: Type.Boolean({ default: false }),
    reportSelfMessage: Type.Boolean({ default: false })
});

const HttpClientConfigSchema = Type.Object({
    name: Type.String({ default: 'http-client' }),
    enable: Type.Boolean({ default: false }),
    url: Type.String({ default: 'http://localhost:8080' }),
    messagePostFormat: Type.String({ default: 'array' }),
    reportSelfMessage: Type.Boolean({ default: false }),
    token: Type.String({ default: '' }),
    debug: Type.Boolean({ default: false })
});

const WebsocketServerConfigSchema = Type.Object({
    name: Type.String({ default: 'websocket-server' }),
    enable: Type.Boolean({ default: false }),
    host: Type.String({ default: '0.0.0.0' }),
    port: Type.Number({ default: 3001 }),
    messagePostFormat: Type.String({ default: 'array' }),
    reportSelfMessage: Type.Boolean({ default: false }),
    token: Type.String({ default: '' }),
    enableForcePushEvent: Type.Boolean({ default: true }),
    debug: Type.Boolean({ default: false }),
    heartInterval: Type.Number({ default: 30000 })
});

const WebsocketClientConfigSchema = Type.Object({
    name: Type.String({ default: 'websocket-client' }),
    enable: Type.Boolean({ default: false }),
    url: Type.String({ default: 'ws://localhost:8082' }),
    messagePostFormat: Type.String({ default: 'array' }),
    reportSelfMessage: Type.Boolean({ default: false }),
    reconnectInterval: Type.Number({ default: 5000 }),
    token: Type.String({ default: '' }),
    debug: Type.Boolean({ default: false }),
    heartInterval: Type.Number({ default: 30000 })
});

const PluginConfigSchema = Type.Object({
    name: Type.String({ default: 'plugin' }),
    enable: Type.Boolean({ default: false }),
    messagePostFormat: Type.String({ default: 'array' }),
    reportSelfMessage: Type.Boolean({ default: false }),
    debug: Type.Boolean({ default: false }),
});

const NetworkConfigSchema = Type.Object({
    httpServers: Type.Array(HttpServerConfigSchema, { default: [] }),
    httpSseServers: Type.Array(HttpSseServerConfigSchema, { default: [] }),
    httpClients: Type.Array(HttpClientConfigSchema, { default: [] }),
    websocketServers: Type.Array(WebsocketServerConfigSchema, { default: [] }),
    websocketClients: Type.Array(WebsocketClientConfigSchema, { default: [] }),
    plugins: Type.Array(PluginConfigSchema, { default: [] })
}, { default: {} });

export const OneBotConfigSchema = Type.Object({
    network: NetworkConfigSchema,
    musicSignUrl: Type.String({ default: '' }),
    enableLocalFile2Url: Type.Boolean({ default: false }),
    parseMultMsg: Type.Boolean({ default: false })
});

export type OneBotConfig = Static<typeof OneBotConfigSchema>;
export type HttpServerConfig = Static<typeof HttpServerConfigSchema>;
export type HttpSseServerConfig = Static<typeof HttpSseServerConfigSchema>;
export type HttpClientConfig = Static<typeof HttpClientConfigSchema>;
export type WebsocketServerConfig = Static<typeof WebsocketServerConfigSchema>;
export type WebsocketClientConfig = Static<typeof WebsocketClientConfigSchema>;
export type PluginConfig = Static<typeof PluginConfigSchema>;

export type NetworkAdapterConfig = HttpServerConfig | HttpSseServerConfig | HttpClientConfig | WebsocketServerConfig | WebsocketClientConfig | PluginConfig;
export type NetworkConfigKey = keyof OneBotConfig['network'];


export function loadConfig(config: Partial<OneBotConfig>): OneBotConfig {
    const ajv = new Ajv({ useDefaults: true, coerceTypes: true });
    const validate = ajv.compile(OneBotConfigSchema);
    const valid = validate(config);
    if (!valid) {
        throw new Error(ajv.errorsText(validate.errors));
    }
    return config as OneBotConfig;
}