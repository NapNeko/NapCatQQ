import { z } from 'zod';

const HttpServerConfigSchema = z.object({
    name: z.string().default('http-server'),
    enable: z.boolean().default(false),
    port: z.number().default(3000),
    host: z.string().default('0.0.0.0'),
    enableCors: z.boolean().default(true),
    enableWebsocket: z.boolean().default(true),
    messagePostFormat: z.string().default('array'),
    token: z.string().default(''),
    debug: z.boolean().default(false)
});

const HttpSseServerConfigSchema = z.object({
    name: z.string().default('http-sse-server'),
    enable: z.boolean().default(false),
    port: z.number().default(3000),
    host: z.string().default('0.0.0.0'),
    enableCors: z.boolean().default(true),
    enableWebsocket: z.boolean().default(true),
    messagePostFormat: z.string().default('array'),
    token: z.string().default(''),
    debug: z.boolean().default(false),
    reportSelfMessage: z.boolean().default(false)
});

const HttpClientConfigSchema = z.object({
    name: z.string().default('http-client'),
    enable: z.boolean().default(false),
    url: z.string().default('http://localhost:8080'),
    messagePostFormat: z.string().default('array'),
    reportSelfMessage: z.boolean().default(false),
    token: z.string().default(''),
    debug: z.boolean().default(false)
});

const WebsocketServerConfigSchema = z.object({
    name: z.string().default('websocket-server'),
    enable: z.boolean().default(false),
    host: z.string().default('0.0.0.0'),
    port: z.number().default(3001),
    messagePostFormat: z.string().default('array'),
    reportSelfMessage: z.boolean().default(false),
    token: z.string().default(''),
    enableForcePushEvent: z.boolean().default(true),
    debug: z.boolean().default(false),
    heartInterval: z.number().default(30000)
});

const WebsocketClientConfigSchema = z.object({
    name: z.string().default('websocket-client'),
    enable: z.boolean().default(false),
    url: z.string().default('ws://localhost:8082'),
    messagePostFormat: z.string().default('array'),
    reportSelfMessage: z.boolean().default(false),
    reconnectInterval: z.number().default(5000),
    token: z.string().default(''),
    debug: z.boolean().default(false),
    heartInterval: z.number().default(30000)
});

const PluginConfigSchema = z.object({
    name: z.string().default('plugin'),
    enable: z.boolean().default(false),
    messagePostFormat: z.string().default('array'),
    reportSelfMessage: z.boolean().default(false),
    debug: z.boolean().default(false),
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
    musicSignUrl: z.string().default(''),
    enableLocalFile2Url: z.boolean().default(false),
    parseMultMsg: z.boolean().default(false)
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