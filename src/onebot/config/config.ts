export interface AdapterConfig {
    name: string;
    enable: boolean;
    [key: string]: any;
}

const createDefaultAdapterConfig = <T extends AdapterConfig>(config: T): T => config;

export const httpServerDefaultConfigs = createDefaultAdapterConfig({
    name: 'http-server',
    enable: false,
    port: 3000,
    host: '0.0.0.0',
    enableCors: true,
    enableWebsocket: true,
    messagePostFormat: 'array',
    reportSelfMessage: false,
    token: '',
    debug: false,
});
export type HttpServerConfig = typeof httpServerDefaultConfigs;

export const httpClientDefaultConfigs = createDefaultAdapterConfig({
    name: 'http-client',
    enable: false,
    url: 'http://localhost:8080',
    messagePostFormat: 'array',
    reportSelfMessage: false,
    token: '',
    debug: false,
});
export type HttpClientConfig = typeof httpClientDefaultConfigs;

export const websocketServerDefaultConfigs = createDefaultAdapterConfig({
    name: 'websocket-server',
    enable: false,
    host: '0.0.0.0',
    port: 3002,
    messagePostFormat: 'array',
    reportSelfMessage: false,
    token: '',
    enablePushEvent: true,
    debug: false,
    heartInterval: 0,
});
export type WebsocketServerConfig = typeof websocketServerDefaultConfigs;

export const websocketClientDefaultConfigs = createDefaultAdapterConfig({
    name: 'websocket-client',
    enable: false,
    url: 'ws://localhost:8082',
    messagePostFormat: 'array',
    reportSelfMessage: false,
    token: '',
    debug: false,
    heartInterval: 0,
});
export type WebsocketClientConfig = typeof websocketClientDefaultConfigs;

export interface NetworkConfig {
    httpServers: Array<HttpServerConfig>;
    httpClients: Array<HttpClientConfig>;
    websocketServers: Array<WebsocketServerConfig>;
    websocketClients: Array<WebsocketClientConfig>;
}

export function mergeConfigs<T extends AdapterConfig>(defaultConfig: T, userConfig: Partial<T>): T {
    return { ...defaultConfig, ...userConfig };
}

export interface OneBotConfig {
    network: NetworkConfig; //网络配置
    musicSignUrl: string; //音乐签名地址
    enableLocalFile2Url: boolean;
}

const createDefaultConfig = <T>(config: T): T => config;

export const defaultOneBotConfigs = createDefaultConfig<OneBotConfig>({
    network: {
        httpServers: [],
        httpClients: [],
        websocketServers: [],
        websocketClients: [],
    },
    musicSignUrl: '',
    enableLocalFile2Url: false,
});

export const mergeNetworkDefaultConfig = {
    httpServers: httpServerDefaultConfigs,
    httpClients: httpClientDefaultConfigs,
    websocketServers: websocketServerDefaultConfigs,
    websocketClients: websocketClientDefaultConfigs,
} as const;

type NetworkConfigKeys = keyof typeof mergeNetworkDefaultConfig;

// TODO: wrong type hint in userConfig (aka old userConfig)
export function mergeOneBotConfigs(defaultConfig: OneBotConfig, userConfig: Partial<OneBotConfig>): OneBotConfig {
    const mergedConfig = { ...defaultConfig };

    if (userConfig.network) {
        mergedConfig.network = { ...defaultConfig.network };
        for (const key in userConfig.network) {
            const userNetworkConfig = userConfig.network[key as keyof NetworkConfig];
            const defaultNetworkConfig = mergeNetworkDefaultConfig[key as NetworkConfigKeys];
            if (Array.isArray(userNetworkConfig)) {
                mergedConfig.network[key as keyof NetworkConfig] = userNetworkConfig.map<any>((e) =>
                    mergeConfigs(defaultNetworkConfig, e)
                );
            }
        }
    }
    if (userConfig.musicSignUrl !== undefined) {
        mergedConfig.musicSignUrl = userConfig.musicSignUrl;
    }
    return mergedConfig;
}
