import { z } from 'zod';
import { actionType } from '../action/type';

const HttpServerConfigSchema = z.object({
    name: actionType.string().default('http-server'),
    enable: actionType.boolean().default(false),
    port: actionType.number().default(3000),
    host: actionType.string().default('0.0.0.0'),
    enableCors: actionType.boolean().default(true),
    enableWebsocket: actionType.boolean().default(true),
    messagePostFormat: actionType.string().default('array'),
    token: actionType.string().default(''),
    debug: actionType.boolean().default(false)
});

const HttpSseServerConfigSchema = z.object({
    name: actionType.string().default('http-sse-server'),
    enable: actionType.boolean().default(false),
    port: actionType.number().default(3000),
    host: actionType.string().default('0.0.0.0'),
    enableCors: actionType.boolean().default(true),
    enableWebsocket: actionType.boolean().default(true),
    messagePostFormat: actionType.string().default('array'),
    token: actionType.string().default(''),
    debug: actionType.boolean().default(false),
    reportSelfMessage: actionType.boolean().default(false)
});

const HttpClientConfigSchema = z.object({
    name: actionType.string().default('http-client'),
    enable: actionType.boolean().default(false),
    url: actionType.string().default('http://localhost:8080'),
    messagePostFormat: actionType.string().default('array'),
    reportSelfMessage: actionType.boolean().default(false),
    token: actionType.string().default(''),
    debug: actionType.boolean().default(false)
});

const WebsocketServerConfigSchema = z.object({
    name: actionType.string().default('websocket-server'),
    enable: actionType.boolean().default(false),
    host: actionType.string().default('0.0.0.0'),
    port: actionType.number().default(3001),
    messagePostFormat: actionType.string().default('array'),
    reportSelfMessage: actionType.boolean().default(false),
    token: actionType.string().default(''),
    enableForcePushEvent: actionType.boolean().default(true),
    debug: actionType.boolean().default(false),
    heartInterval: actionType.number().default(30000)
});

const WebsocketClientConfigSchema = z.object({
    name: actionType.string().default('websocket-client'),
    enable: actionType.boolean().default(false),
    url: actionType.string().default('ws://localhost:8082'),
    messagePostFormat: actionType.string().default('array'),
    reportSelfMessage: actionType.boolean().default(false),
    reconnectInterval: actionType.number().default(5000),
    token: actionType.string().default(''),
    debug: actionType.boolean().default(false),
    heartInterval: actionType.number().default(30000)
});

const PluginConfigSchema = z.object({
    name: actionType.string().default('plugin'),
    enable: actionType.boolean().default(false),
    messagePostFormat: actionType.string().default('array'),
    reportSelfMessage: actionType.boolean().default(false),
    debug: actionType.boolean().default(false),
});

const NetworkConfigSchema = z.object({
    httpServers: z.array(HttpServerConfigSchema).default([]),
    httpSseServers: z.array(HttpSseServerConfigSchema).default([]),
    httpClients: z.array(HttpClientConfigSchema).default([]),
    websocketServers: z.array(WebsocketServerConfigSchema).default([]),
    websocketClients: z.array(WebsocketClientConfigSchema).default([]),
    plugins: z.array(PluginConfigSchema).default([])
}).default({});

export const OneBotConfigSchema = z.object({
    network: NetworkConfigSchema,
    musicSignUrl: actionType.string().default(''),
    enableLocalFile2Url: actionType.boolean().default(false),
    parseMultMsg: actionType.boolean().default(false)
});

export type OneBotConfig = z.infer<typeof OneBotConfigSchema>;
export type HttpServerConfig = z.infer<typeof HttpServerConfigSchema>;
export type HttpSseServerConfig = z.infer<typeof HttpSseServerConfigSchema>;
export type HttpClientConfig = z.infer<typeof HttpClientConfigSchema>;
export type WebsocketServerConfig = z.infer<typeof WebsocketServerConfigSchema>;
export type WebsocketClientConfig = z.infer<typeof WebsocketClientConfigSchema>;
export type PluginConfig = z.infer<typeof PluginConfigSchema>;

export type NetworkAdapterConfig = HttpServerConfig | HttpSseServerConfig | HttpClientConfig | WebsocketServerConfig | WebsocketClientConfig | PluginConfig;
export type NetworkConfigKey = keyof OneBotConfig['network'];

export function loadConfig(config: Partial<OneBotConfig>): OneBotConfig {
    try {
        return OneBotConfigSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '));
        }
        throw error;
    }
}