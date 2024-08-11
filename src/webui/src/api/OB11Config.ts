import { RequestHandler } from 'express';
import { WebUiDataRuntime } from '../helper/Data';
import { existsSync, readFileSync } from 'node:fs';
import { OB11Config } from '@/webui/ui/components/WebUiApiOB11Config';
import { resolve } from 'node:path';
import { webUiPathWrapper } from '@/webui';

const isEmpty = (data: any) =>
    data === undefined || data === null || data === '';
export const OB11GetConfigHandler: RequestHandler = async (req, res) => {
    const isLogin = await WebUiDataRuntime.getQQLoginStatus();
    if (!isLogin) {
        res.send({
            code: -1,
            message: 'Not Login',
        });
        return;
    }
    const uin = await WebUiDataRuntime.getQQLoginUin();
    const configFilePath = resolve(webUiPathWrapper.configPath, `./onebot11_${uin}.json`);
    //console.log(configFilePath);
    let data: OB11Config;
    try {
        data = JSON.parse(
            existsSync(configFilePath)
                ? readFileSync(configFilePath).toString()
                : readFileSync(resolve(webUiPathWrapper.configPath, './onebot11.json')).toString(),
        );
    } catch (e) {
        data = {} as OB11Config;
        res.send({
            code: -1,
            message: 'Config Get Error',
        });
        return;
    }
    res.send({
        code: 0,
        message: 'success',
        data: data,
    });
    return;
};
export const OB11SetConfigHandler: RequestHandler = async (req, res) => {
    const isLogin = await WebUiDataRuntime.getQQLoginStatus();
    if (!isLogin) {
        res.send({
            code: -1,
            message: 'Not Login',
        });
        return;
    }
    if (isEmpty(req.body.config)) {
        res.send({
            code: -1,
            message: 'config is empty',
        });
        return;
    }
    let SetResult;
    try {
        await WebUiDataRuntime.setOB11Config(JSON.parse(req.body.config));
        SetResult = true;
    } catch (e) {
        SetResult = false;
    }
    if (SetResult) {
        res.send({
            code: 0,
            message: 'success',
        });
    } else {
        res.send({
            code: -1,
            message: 'Config Set Error',
        });
    }

    return;
};
