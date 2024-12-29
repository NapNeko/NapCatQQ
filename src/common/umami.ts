import https from 'node:https';
import { napCatVersion } from './version';

export class umamiTrace {
    static napcatVersion = napCatVersion;
    static qqversion = '1.0.0';

    static init(qqversion: string) {
        this.qqversion = qqversion;
        setInterval(() => {
            this.trackEvent('heartbeat');
        }, 5 * 60 * 1000);
    }

    static trackEvent(eventName: string, info?: string) {
        const StatesData = {
            type: 'event',
            payload: {
                'website': '596cbbb2-1740-4373-a807-cf3d0637bfa7',
                'hostname': 'trace.napneko.icu',
                'title': 'NapCat ' + umamiTrace.napcatVersion,
                'url': '/' + umamiTrace.qqversion + '/' + umamiTrace.napcatVersion + '/' + eventName + (info ? '' : '/' + info),
                'referrer': 'https://napcat.onebot.napneko.icu/',
            }
        };

        let request = https.request({
            hostname: '104.19.42.72',// 固定 IP
            port: 443,
            path: '/api/send',
            method: 'POST',
            headers: {
                "Host": "umami.napneko.icu",
                "Content-Type": "application/json",
                "User-Agent": `Mozilla/5.0 Umami/${process.version}`
            }
        }, (res) => {
            res.on('error', (error) => {

            });
            res.on('data', (data) => {

            });
        });

        request.write(JSON.stringify(StatesData));
        request.end();
    }
}