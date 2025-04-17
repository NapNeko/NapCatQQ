import { z } from 'zod';
import { coerce } from '../../common/coerce';

const HttpServerConfigSchema = z.object({
    name: coerce.string().default('http-server'),
    enable: coerce.boolean().default(false),
    port: coerce.number().default(3000),
    host: coerce.string().default('0.0.0.0'),
    enableCors: coerce.boolean().default(true),
    enableWebsocket: coerce.boolean().default(true),
    messagePostFormat: coerce.string().default('array'),
    token: coerce.string().default(''),
    debug: coerce.boolean().default(false)
});

const HttpSseServerConfigSchema = z.object({
    name: coerce.string().default('http-sse-server'),
    enable: coerce.boolean().default(false),
    port: coerce.number().default(3000),
    host: coerce.string().default('0.0.0.0'),
    enableCors: coerce.boolean().default(true),
    enableWebsocket: coerce.boolean().default(true),
    messagePostFormat: coerce.string().default('array'),
    token: coerce.string().default(''),
    debug: coerce.boolean().default(false),
    reportSelfMessage: coerce.boolean().default(false)
});

const HttpClientConfigSchema = z.object({
    name: coerce.string().default('http-client'),
    enable: coerce.boolean().default(false),
    url: coerce.string().default('http://localhost:8080'),
    messagePostFormat: coerce.string().default('array'),
    reportSelfMessage: coerce.boolean().default(false),
    token: coerce.string().default(''),
    debug: coerce.boolean().default(false)
});

const WebsocketServerConfigSchema = z.object({
    name: coerce.string().default('websocket-server'),
    enable: coerce.boolean().default(false),
    host: coerce.string().default('0.0.0.0'),
    port: coerce.number().default(3001),
    messagePostFormat: coerce.string().default('array'),
    reportSelfMessage: coerce.boolean().default(false),
    token: coerce.string().default(''),
    enableForcePushEvent: coerce.boolean().default(true),
    debug: coerce.boolean().default(false),
    heartInterval: coerce.number().default(30000)
});

const WebsocketClientConfigSchema = z.object({
    name: coerce.string().default('websocket-client'),
    enable: coerce.boolean().default(false),
    url: coerce.string().default('ws://localhost:8082'),
    messagePostFormat: coerce.string().default('array'),
    reportSelfMessage: coerce.boolean().default(false),
    reconnectInterval: coerce.number().default(5000),
    token: coerce.string().default(''),
    debug: coerce.boolean().default(false),
    heartInterval: coerce.number().default(30000)
});

const PluginConfigSchema = z.object({
    name: coerce.string().default('plugin'),
    enable: coerce.boolean().default(false),
    messagePostFormat: coerce.string().default('array'),
    reportSelfMessage: coerce.boolean().default(false),
    debug: coerce.boolean().default(false),
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
    musicSignUrl: coerce.string().default(''),
    enableLocalFile2Url: coerce.boolean().default(false),
    parseMultMsg: coerce.boolean().default(false)
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