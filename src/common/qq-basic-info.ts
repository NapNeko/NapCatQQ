import path from 'node:path';
import fs from 'node:fs';
import { systemPlatform } from '@/common/system';
import { getDefaultQQVersionConfigInfo, getQQVersionConfigPath } from './helper';
import AppidTable from '@/core/external/appid.json';
import { LogWrapper } from './log';

export class QQBasicInfoWrapper {
    QQMainPath: string | undefined;
    QQPackageInfoPath: string | undefined;
    QQVersionConfigPath: string | undefined;
    isQuickUpdate: boolean | undefined;
    QQVersionConfig: QQVersionConfigType | undefined;
    QQPackageInfo: QQPackageInfoType | undefined;
    QQVersionAppid: string | undefined;
    QQVersionQua: string | undefined;
    context: { logger: LogWrapper };

    constructor(context: { logger: LogWrapper }) {
        //基础目录获取
        this.context = context;
        this.QQMainPath = process.execPath;
        this.QQPackageInfoPath = path.join(path.dirname(this.QQMainPath), 'resources', 'app', 'package.json');
        this.QQVersionConfigPath = getQQVersionConfigPath(this.QQMainPath);

        //基础信息获取 无快更则启用默认模板填充
        this.isQuickUpdate = !!this.QQVersionConfigPath;
        this.QQVersionConfig = this.isQuickUpdate
            ? JSON.parse(fs.readFileSync(this.QQVersionConfigPath!).toString())
            : getDefaultQQVersionConfigInfo();
        this.QQPackageInfo = JSON.parse(fs.readFileSync(this.QQPackageInfoPath).toString());
        const { appid: IQQVersionAppid, qua: IQQVersionQua } = this.getAppidV2();
        this.QQVersionAppid = IQQVersionAppid;
        this.QQVersionQua = IQQVersionQua;
    }

    //基础函数
    getQQBuildStr() {
        return this.isQuickUpdate ? this.QQVersionConfig?.buildId : this.QQPackageInfo?.buildVersion;
    }

    getFullQQVesion() {
        const version = this.isQuickUpdate ? this.QQVersionConfig?.curVersion : this.QQPackageInfo?.version;
        if (!version) throw new Error('QQ版本获取失败');
        return version;
    }

    requireMinNTQQBuild(buildStr: string) {
        const currentBuild = +(this.getQQBuildStr() ?? '0');
        if (currentBuild == 0) throw new Error('QQBuildStr获取失败');
        return currentBuild >= parseInt(buildStr);
    }

    //此方法不要直接使用
    getQUAInternal() {
        return systemPlatform === 'linux'
            ? `V1_LNX_NQ_${this.getFullQQVesion()}_${this.getQQBuildStr()}_GW_B`
            : `V1_WIN_NQ_${this.getFullQQVesion()}_${this.getQQBuildStr()}_GW_B`;
    }

    getAppidV2(): { appid: string; qua: string } {
        const appidTbale = AppidTable as unknown as QQAppidTableType;
        try {
            const fullVersion = this.getFullQQVesion();
            if (!fullVersion) throw new Error('QQ版本获取失败');
            const data = appidTbale[fullVersion];
            if (data) {
                return data;
            }
        } catch (e) {
            this.context.logger.log(`[QQ版本兼容性检测] 获取Appid异常 请检测NapCat/QQNT是否正常`);
        }
        // 以下是兜底措施
        this.context.logger.log(
            `[QQ版本兼容性检测] ${this.getFullQQVesion()} 版本兼容性不佳，可能会导致一些功能无法正常使用`,
        );
        return { appid: systemPlatform === 'linux' ? '537240795' : '537240709', qua: this.getQUAInternal() };
    }
}
