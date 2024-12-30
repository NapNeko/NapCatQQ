import https from 'node:https';
import { napCatVersion } from './version';
import os from 'os';
export class UmamiTrace {
    static napcatVersion = napCatVersion;
    static qqversion = '1.0.0';
    static guid = 'default-user';
    static heartbeatInterval: NodeJS.Timeout | null = null;
    static website: string = '1fabb2b1-c3a3-4416-b1be-31e2cbdce978';
    static referrer: string = 'https://trace.napneko.icu/';
    static hostname: string = 'trace.napneko.icu';
    static ua: string = '';

    static init(qqversion: string, guid: string) {
        this.qqversion = qqversion;
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

    static identifyUser(guid: string) {
        this.guid = guid;
        const data = {
            napcat_version: this.napcatVersion,
            qq_version: this.qqversion,
            guid: guid
        };
        this.sendRequest({ website: this.website, ...data }, 'identify');
    }

    static sendEvent(event: string, data?: object) {
        const env = process.env;
        const language = env.LANG || env.LANGUAGE || env.LC_ALL || env.LC_MESSAGES;
        const payload = {
            name: event,
            hostname: this.hostname,
            referrer: this.referrer,
            website: this.website,
            language: language || 'es-US',
            napcat_version: this.napcatVersion,
            qq_version: this.qqversion,
        };
        this.sendRequest(payload);
    }

    static sendTrace(eventName: string) {
        const payload = {
            website: this.website,
            hostname: this.hostname,
            title: 'NapCat ' + this.napcatVersion,
            url: `/${this.qqversion}/${this.napcatVersion}/${eventName}`,
            referrer: this.referrer,
        };
        this.sendRequest(payload);
    }

    static sendRequest(payload: object, type = 'event') {
        const options = {
            hostname: '104.19.42.72', // 固定 IP 或者从 hostUrl 获取
            port: 443,
            path: '/api/send',
            method: 'POST',
            headers: {
                "Host": "umami.napneko.icu",
                "Content-Type": "application/json",
                "User-Agent": this.ua
            }
        };

        const request = https.request(options, (res) => {
            res.on('error', (error) => {

            });
            res.on('data', (data) => {

            });
        });
       
        request.write(JSON.stringify({ type, payload }));
        request.end();
    }

    static startHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        this.heartbeatInterval = setInterval(() => {
            this.sendEvent('heartbeat', {
                title: 'NapCat ' + this.napcatVersion,
                language: process.env.LANG || 'en-US',
                url: `/${this.qqversion}/${this.napcatVersion}/heartbeat`,
                version: this.napcatVersion,
                qq_version: this.qqversion,
                user_id: this.guid
            });
        }, 5 * 60 * 1000);
    }

    static stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
}