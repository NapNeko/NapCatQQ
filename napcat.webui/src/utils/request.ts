import { MessagePlugin } from 'tdesign-vue-next';
import router from '@/router/index.js';

export const request = async (input: RequestInfo | URL, init?: RequestInit) => {
    const res = await fetch(input, init);
    const json = await res.json();
    if (json.message.includes('Unauthorized')) {
        MessagePlugin.error('Token 过期啦, 重新登录吧');
        localStorage.clear();
        router.push('/webui');
    }
    res.json = async () => json;
    return res;
};
