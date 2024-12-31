import https from 'node:https';
import { napCatVersion } from './version';
import os from 'node:os';
export class UmamiTraceCore {
    napcatVersion = napCatVersion;
    qqversion = '1.0.0';
    guid = 'default-user';
    heartbeatInterval: NodeJS.Timeout | null = null;
    website: string = '596cbbb2-1740-4373-a807-cf3d0637bfa7';
    referrer: string = 'https://trace.napneko.icu/';
    hostname: string = 'trace.napneko.icu';
    ua: string = '';
    workname: string = 'default';
    bootTime = Date.now();
    cache: string = '';
    init(qqversion: string, guid: string, workname: string) {
        this.qqversion = qqversion;
        this.workname = workname;
        let UaList = {
            'linux': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/124.0.0.0 Safari/537.36 PTST/240508.140043',
            'win32': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.2128.93 Safari/537.36',
            'darwin': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36',
        };

        try {
            if (process.platform === 'win32') {
                const ntVersion = os.release();
                UaList.win32 = `Mozilla/5.0 (Windows NT ${ntVersion}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.2128.93 Safari/537.36`;
            } else if (process.platform === 'darwin') {
                const macVersion = os.release();
                UaList.darwin = `Mozilla/5.0 (Macintosh; Intel Mac OS X ${macVersion}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36`;
            }
        } catch (error) {
            this.ua = UaList.win32;
        }

        this.ua = UaList[process.platform as keyof typeof UaList] || UaList.win32;

        this.identifyUser(guid);
        this.startHeartbeat();
    }

    identifyUser(guid: string) {
        this.guid = guid;
        const data = {
            napcat_version: this.napcatVersion,
            qq_version: this.qqversion,
            napcat_working: this.workname,
            device_guid: this.guid,
            device_platform: os.platform(),
            device_arch: os.arch(),
            boot_time: new Date(this.bootTime + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
            sys_time: new Date(Date.now() - os.uptime() * 1000 + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)
        };
        this.sendEvent(
            {
                website: this.website,
                hostname: this.hostname,
                referrer: this.referrer,
                tittle: 'NapCat ' + this.napcatVersion,
                url: `/${this.qqversion}/${this.napcatVersion}/${this.workname}/identify`,
            },
            data,
            'identify'
        );
    }

    sendEvent(event: string | object, data?: object, type = 'event') {
        const env = process.env;
        const language = env.LANG || env.LANGUAGE || env.LC_ALL || env.LC_MESSAGES;
        const payload = {
            ...(typeof event === 'string' ? { event } : event),
            hostname: this.hostname,
            referrer: this.referrer,
            website: this.website,
            language: language || 'en-US',
            screen: '1920x1080',
            data: {
                ...data
            }
        };
        this.sendRequest(payload, type);
    }

    sendTrace(eventName: string, data: string = '') {
        const payload = {
            website: this.website,
            hostname: this.hostname,
            title: 'NapCat ' + this.napcatVersion,
            url: `/${this.qqversion}/${this.napcatVersion}/${this.workname}/${eventName}` + (!!data ? `/${data}` : ''),
            referrer: this.referrer,
        };
        this.sendRequest(payload);
    }

    sendRequest(payload: object, type = 'event') {
        const options = {
            hostname: '104.19.42.72', // 固定 IP 或者从 hostUrl 获取
            port: 443,
            path: '/api/send',
            method: 'POST',
            headers: {
                "Host": "umami.napneko.icu",
                "Content-Type": "application/json",
                "User-Agent": this.ua,
                ...(this.cache ? { 'x-umami-cache': this.cache } : {})
            }
        };

        const request = https.request(options, (res) => {
            res.on('error', (error) => {

            });
            res.on('data', (data) => {
                if (!this.cache) {
                    this.cache = data.toString();
                }
            });
        }).on('error', () => { });

        request.write(JSON.stringify({ type, payload }));
        request.end();
    }

    startHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        this.heartbeatInterval = setInterval(() => {
            this.sendEvent({
                name: 'heartbeat',
                title: 'NapCat ' + this.napcatVersion,
                url: `/${this.qqversion}/${this.napcatVersion}/${this.workname}/heartbeat`,
            });
        }, 5 * 60 * 1000);
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
}
export const UmamiTrace = new UmamiTraceCore();