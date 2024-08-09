import { OB11MessageData } from '@/onebot/types';

function checkSendMessage(sendMsgList: OB11MessageData[]) {
    function checkUri(uri: string): boolean {
        const pattern = /^(file:\/\/|http:\/\/|https:\/\/|base64:\/\/)/;
        return pattern.test(uri);
    }

    for (const msg of sendMsgList) {
        if (msg['type'] && msg['data']) {
            const type = msg['type'];
            const data = msg['data'];
            if (type === 'text' && !data['text']) {
                return 400;
            } else if (['image', 'voice', 'record'].includes(type)) {
                if (!data['file']) {
                    return 400;
                } else {
                    if (checkUri(data['file'])) {
                        return 200;
                    } else {
                        return 400;
                    }
                }

            } else if (type === 'at' && !data['qq']) {
                return 400;
            } else if (type === 'reply' && !data['id']) {
                return 400;
            }
        } else {
            return 400;
        }
    }
    return 200;
}
