export interface AdapterConfig {
    type: string;  // websocket-client, websocket-server, http-server, http-client
    enabled: boolean;
    [key: string]: any;
}

const createDefaultConfig = <T extends AdapterConfig>(config: T): T => config;

export const httpServerDefaultConfig = createDefaultConfig({
    type: 'http-server',
    enabled: false,
    port: '3000',
    host: '0.0.0.0',
    enableCors: true,
    enableWebsocket: true,
    messagePostFormat: 'array',
    reportSelfMessage: false,
    token: '',
});

export const httpClientDefaultConfig = createDefaultConfig({
    type: 'http-client',
    enabled: false,
    url: 'http://localhost:8080',
    messagePostFormat: 'array',
    reportSelfMessage: false,
    token: '',
});

export const websocketServerDefaultConfig = createDefaultConfig({
    type: 'websocket-server',
    enabled: false,
    host: '0.0.0.0',
    port: '3001',
    messagePostFormat: 'array',
    reportSelfMessage: false,
    token: '',
});

export const websocketClientDefaultConfig = createDefaultConfig({
    type: 'websocket-client',
    enabled: false,
    url: 'ws://localhost:8082',
    messagePostFormat: 'array',
    reportSelfMessage: false,
    token: '',
});

export type HttpServerConfig = typeof httpServerDefaultConfig;
export type HttpClientConfig = typeof httpClientDefaultConfig;
export type WebsocketServerConfig = typeof websocketServerDefaultConfig;
export type WebsocketClientConfig = typeof websocketClientDefaultConfig;

export function mergeConfigs<T extends AdapterConfig>(defaultConfig: T, userConfig: Partial<T>): T {
    return { ...defaultConfig, ...userConfig };
}