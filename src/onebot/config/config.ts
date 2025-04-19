import { z } from 'zod';

const HttpServerConfigSchema = z.object({
    name: z.coerce.string().default('http-server'),
    enable: z.coerce.boolean().default(false),
    port: z.coerce.number().default(3000),
    host: z.coerce.string().default('0.0.0.0'),
    enableCors: z.coerce.boolean().default(true),
    enableWebsocket: z.coerce.boolean().default(true),
    messagePostFormat: z.coerce.string().default('array'),
    token: z.coerce.string().default(''),
    debug: z.coerce.boolean().default(false)
});

const HttpSseServerConfigSchema = z.object({
    name: z.coerce.string().default('http-sse-server'),
    enable: z.coerce.boolean().default(false),
    port: z.coerce.number().default(3000),
    host: z.coerce.string().default('0.0.0.0'),
    enableCors: z.coerce.boolean().default(true),
    enableWebsocket: z.coerce.boolean().default(true),
    messagePostFormat: z.coerce.string().default('array'),
    token: z.coerce.string().default(''),
    debug: z.coerce.boolean().default(false),
    reportSelfMessage: z.coerce.boolean().default(false)
});

const HttpClientConfigSchema = z.object({
    name: z.coerce.string().default('http-client'),
    enable: z.coerce.boolean().default(false),
    url: z.coerce.string().default('http://localhost:8080'),
    messagePostFormat: z.coerce.string().default('array'),
    reportSelfMessage: z.coerce.boolean().default(false),
    token: z.coerce.string().default(''),
    debug: z.coerce.boolean().default(false)
});

const WebsocketServerConfigSchema = z.object({
    name: z.coerce.string().default('websocket-server'),
    enable: z.coerce.boolean().default(false),
    host: z.coerce.string().default('0.0.0.0'),
    port: z.coerce.number().default(3001),
    messagePostFormat: z.coerce.string().default('array'),
    reportSelfMessage: z.coerce.boolean().default(false),
    token: z.coerce.string().default(''),
    enableForcePushEvent: z.coerce.boolean().default(true),
    debug: z.coerce.boolean().default(false),
    heartInterval: z.coerce.number().default(30000)
});

const WebsocketClientConfigSchema = z.object({
    name: z.coerce.string().default('websocket-client'),
    enable: z.coerce.boolean().default(false),
    url: z.coerce.string().default('ws://localhost:8082'),
    messagePostFormat: z.coerce.string().default('array'),
    reportSelfMessage: z.coerce.boolean().default(false),
    reconnectInterval: z.coerce.number().default(5000),
    token: z.coerce.string().default(''),
    debug: z.coerce.boolean().default(false),
    heartInterval: z.coerce.number().default(30000)
});

const PluginConfigSchema = z.object({
    name: z.coerce.string().default('plugin'),
    enable: z.coerce.boolean().default(false),
    messagePostFormat: z.coerce.string().default('array'),
    reportSelfMessage: z.coerce.boolean().default(false),
    debug: z.coerce.boolean().default(false),
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
    musicSignUrl: z.coerce.string().default(''),
    enableLocalFile2Url: z.coerce.boolean().default(false),
    parseMultMsg: z.coerce.boolean().default(false)
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