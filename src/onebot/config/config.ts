interface v1Config {
    http: {
        enable: boolean;
        host: string;
        port: number;
        secret: string;
        enableHeart: boolean;
        enablePost: boolean;
        postUrls: string[];
    };
    ws: {
        enable: boolean;
        host: string;
        port: number;
    };
    reverseWs: {
        enable: boolean;
        urls: string[];
    };
    debug: boolean;
    heartInterval: number;
    messagePostFormat: string;
    enableLocalFile2Url: boolean;
    musicSignUrl: string;
    reportSelfMessage: boolean;
    token: string;
}
export interface AdapterConfigInner {
    name: string;
    enable: boolean;
}
export type AdapterConfigWrap = AdapterConfigInner & Partial<NetworkConfigAdapter>;

export interface AdapterConfig extends AdapterConfigInner {
    [key: string]: any;
}

const createDefaultAdapterConfig = <T extends AdapterConfig>(config: T): T => config;

export const httpServerDefaultConfigs = createDefaultAdapterConfig({
    name: 'http-server',
    enable: false as boolean,
    port: 3000,
    host: '0.0.0.0',
    enableCors: true,
    enableWebsocket: true,
    messagePostFormat: 'array',
    token: '',
    debug: false,
});
export type HttpServerConfig = typeof httpServerDefaultConfigs;

export const httpClientDefaultConfigs = createDefaultAdapterConfig({
    name: 'http-client',
    enable: false as boolean,
    url: 'http://localhost:8080',
    messagePostFormat: 'array',
    reportSelfMessage: false,
    token: '',
    debug: false,
});
export type HttpClientConfig = typeof httpClientDefaultConfigs;

export const websocketServerDefaultConfigs = createDefaultAdapterConfig({
    name: 'websocket-server',
    enable: false as boolean,
    host: '0.0.0.0',
    port: 3001,
    messagePostFormat: 'array',
    reportSelfMessage: false,
    token: '',
    enableForcePushEvent: true,
    debug: false,
    heartInterval: 30000,
});
export type WebsocketServerConfig = typeof websocketServerDefaultConfigs;

export const websocketClientDefaultConfigs = createDefaultAdapterConfig({
    name: 'websocket-client',
    enable: false as boolean,
    url: 'ws://localhost:8082',
    messagePostFormat: 'array',
    reportSelfMessage: false,
    reconnectInterval: 5000,
    token: '',
    debug: false,
    heartInterval: 30000,
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
    network: NetworkConfig; // 网络配置
    musicSignUrl: string; // 音乐签名地址
    enableLocalFile2Url: boolean;
    parseMultMsg: boolean;
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
    parseMultMsg: true
});

export const mergeNetworkDefaultConfig = {
    httpServers: httpServerDefaultConfigs,
    httpClients: httpClientDefaultConfigs,
    websocketServers: websocketServerDefaultConfigs,
    websocketClients: websocketClientDefaultConfigs,
} as const;

export type NetworkConfigAdapter = HttpServerConfig | HttpClientConfig | WebsocketServerConfig | WebsocketClientConfig;
type NetworkConfigKeys = keyof typeof mergeNetworkDefaultConfig;

export function mergeOneBotConfigs(
    userConfig: Partial<OneBotConfig>,
    defaultConfig: OneBotConfig = defaultOneBotConfigs
): OneBotConfig {
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
    if (userConfig.enableLocalFile2Url !== undefined) {
        mergedConfig.enableLocalFile2Url = userConfig.enableLocalFile2Url;
    }
    if (userConfig.parseMultMsg !== undefined) {
        mergedConfig.parseMultMsg = userConfig.parseMultMsg;
    }
    return mergedConfig;
}

function checkIsOneBotConfigV1(v1Config: Partial<v1Config>): boolean {
    return v1Config.http !== undefined || v1Config.ws !== undefined || v1Config.reverseWs !== undefined;
}

export function migrateOneBotConfigsV1(config: Partial<v1Config>): OneBotConfig {
    if (!checkIsOneBotConfigV1(config)) {
        return config as OneBotConfig;
    }
    const mergedConfig = { ...defaultOneBotConfigs };
    if (config.http) {
        mergedConfig.network.httpServers = [
            mergeConfigs(httpServerDefaultConfigs, {
                enable: config.http.enable,
                port: config.http.port,
                host: config.http.host,
                token: config.http.secret,
                debug: config.debug,
                messagePostFormat: config.messagePostFormat,
            }),
        ];
    }
    if (config.ws) {
        mergedConfig.network.websocketServers = [
            mergeConfigs(websocketServerDefaultConfigs, {
                enable: config.ws.enable,
                port: config.ws.port,
                host: config.ws.host,
                token: config.token,
                debug: config.debug,
                messagePostFormat: config.messagePostFormat,
                reportSelfMessage: config.reportSelfMessage,
            }),
        ];
    }
    if (config.reverseWs) {
        mergedConfig.network.websocketClients = config.reverseWs.urls.map((url) =>
            mergeConfigs(websocketClientDefaultConfigs, {
                enable: config.reverseWs?.enable,
                url: url,
                token: config.token,
                debug: config.debug,
                messagePostFormat: config.messagePostFormat,
                reportSelfMessage: config.reportSelfMessage,
            })
        );
    }
    if (config.heartInterval) {
        mergedConfig.network.websocketServers[0].heartInterval = config.heartInterval;
    }
    if (config.musicSignUrl) {
        mergedConfig.musicSignUrl = config.musicSignUrl;
    }
    if (config.enableLocalFile2Url) {
        mergedConfig.enableLocalFile2Url = config.enableLocalFile2Url;
    }
    return mergedConfig;
}
export function getConfigBoolKey(
    configs: Array<NetworkConfigAdapter>,
    prediction: (config: NetworkConfigAdapter) => boolean
): { positive: Array<string>, negative: Array<string> } {
    const result: { positive: string[], negative: string[] } = { positive: [], negative: [] };
    configs.forEach(config => {
        if (prediction(config)) {
            result.positive.push(config.name);
        } else {
            result.negative.push(config.name);
        }
    });
    return result;
}