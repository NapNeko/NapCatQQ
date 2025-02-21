import { GeneralCallResult } from './common';
enum ProxyType {
    CLOSE = 0,
    HTTP = 1,
    SOCKET = 2
}
export interface NodeIKernelMSFService {
    getServerTime(): string;
    setNetworkProxy(param: {
        userName: string,
        userPwd: string,
        address: string,
        port: number,
        proxyType: ProxyType,
        domain: string,
        isSocket: boolean
    }): Promise<GeneralCallResult>;
    getNetworkProxy(): Promise<{
        userName: string,
        userPwd: string,
        address: string,
        port: number,
        proxyType: ProxyType,
        domain: string,
        isSocket: boolean
    }>;
    //http
    //     userName: '',
    //     userPwd: '',
    //     address: '127.0.0.1',
    //     port: 5666,
    //     proxyType: 1,
    //     domain: '',
    //     isSocket: false
    //socket
    // userName: '',
    // userPwd: '',
    // address: '127.0.0.1',
    // port: 5667,
    // proxyType: 2,
    // domain: '',
    // isSocket: true
}