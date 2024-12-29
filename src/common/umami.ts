import https from 'node:https';
import { napCatVersion } from './version';

export class umamiTrace {
    static trackEvent(eventName: string, info?: string) {
        const StatesData = {
            type: 'event',
            payload: {
                'website': '596cbbb2-1740-4373-a807-cf3d0637bfa7',
                'hostname': 'trace.napneko.icu',
                'language': process.env.LANG || 'en-US',
                'title': 'NapCat ' + napCatVersion,
                'url': '/' + napCatVersion + '/' + eventName,
                'referrer': 'https://trace.napneko.icu/' + napCatVersion,
                'info': info
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