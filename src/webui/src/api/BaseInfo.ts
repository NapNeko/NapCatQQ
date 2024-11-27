import { RequestHandler } from 'express';

import { sendSuccess } from '@webapi/utils/response';

// TODO: Implement LogFileListHandler
export const LogFileListHandler: RequestHandler = async (_, res) => {
    const fakeData = {
        uin: 0,
        nick: 'NapCat',
        avatar: 'https://q1.qlogo.cn/g?b=qq&nk=0&s=640',
        status: 'online',
        boottime: Date.now(),
    };
    sendSuccess(res, fakeData);
};
