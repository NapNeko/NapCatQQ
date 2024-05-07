import { RequestHandler } from "express";
import { DataRuntime } from "../helper/Data";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { OB11Config } from "@/webui/ui/components/WebApi";
const isEmpty = (data: any) => data === undefined || data === null || data === '';
export const OB11GetConfigHandler: RequestHandler = async (req, res) => {
    let isLogin = await DataRuntime.getQQLoginStatus();
    if(!isLogin){
        res.send({
            code: -1,
            message: 'Not Login'
        });
        return;
    }
    const uin = await DataRuntime.getQQLoginUin();
    let configFilePath = resolve(__dirname, `./config/onebot_${uin}.json`);
    let data: OB11Config;
    try {
        data = existsSync(configFilePath) ? require(configFilePath) : require(resolve(__dirname, `./config/onebot.json`));
    }
    catch (e) {
        data = {} as OB11Config;
        res.send({
            code: -1,
            message: 'QRCode Get Error'
        });
        return;
    }
    res.send({
        code: 0,
        message: 'success',
        data: data
    });
    return;
}
export const OB11SetConfigHandler: RequestHandler = async (req, res) => {
}