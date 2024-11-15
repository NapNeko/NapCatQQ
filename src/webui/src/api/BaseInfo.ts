import { RequestHandler } from 'express';
import { WebUiDataRuntime } from '../helper/Data';

export const LogFileListHandler: RequestHandler = async (req, res) => {
    res.send({
        code: 0,
        data: {
            uin: 0,
            nick: 'NapCat',
            avatar: 'https://q1.qlogo.cn/g?b=qq&nk=0&s=640',
            status: 'online',
            boottime: Date.now()
        }
    });
};
