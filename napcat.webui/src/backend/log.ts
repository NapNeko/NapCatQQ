import { EventSourcePolyfill } from 'event-source-polyfill';
type LogListItem = string;
type LogListData = LogListItem[];
let eventSourcePoly: EventSourcePolyfill | null = null;
export class LogManager {
    private readonly retCredential: string;
    private readonly apiPrefix: string;

    //调试时http://127.0.0.1:6099/api 打包时 ../api
    constructor(retCredential: string, apiPrefix: string = '../api') {
        this.retCredential = retCredential;
        this.apiPrefix = apiPrefix;
    }
    public async GetLogList(): Promise<LogListData> {
        try {
            const ConfigResponse = await fetch(`${this.apiPrefix}/Log/GetLogList`, {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + this.retCredential,
                    'Content-Type': 'application/json',
                },
            });
            if (ConfigResponse.status == 200) {
                const ConfigResponseJson = await ConfigResponse.json();
                if (ConfigResponseJson.code == 0) {
                    return ConfigResponseJson?.data as LogListData;
                }
            }
        } catch (error) {
            console.error('Error getting LogList:', error);
        }
        return [] as LogListData;
    }
    public async GetLog(FileName: string): Promise<string> {
        try {
            const ConfigResponse = await fetch(`${this.apiPrefix}/Log/GetLog?id=${FileName}`, {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + this.retCredential,
                    'Content-Type': 'application/json',
                },
            });
            if (ConfigResponse.status == 200) {
                const ConfigResponseJson = await ConfigResponse.json();
                if (ConfigResponseJson.code == 0) {
                    return ConfigResponseJson?.data;
                }
            }
        } catch (error) {
            console.error('Error getting LogData:', error);
        }
        return 'null';
    }
    public async getRealTimeLogs(): Promise<EventSourcePolyfill | null> {
        this.creatEventSource();
        return eventSourcePoly;
    }
    private creatEventSource() {
        try {
            eventSourcePoly = new EventSourcePolyfill(`${this.apiPrefix}/Log/GetLogRealTime`, {
                heartbeatTimeout: 3 * 60 * 1000,
                headers: {
                    Authorization: 'Bearer ' + this.retCredential,
                    Accept: 'text/event-stream',
                },
                withCredentials: true,
            });
        } catch (error) {
            console.error('创建SSE连接出错:', error);
        }
    }
}
