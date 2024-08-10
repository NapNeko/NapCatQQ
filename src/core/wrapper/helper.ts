import path from 'node:path';
import fs from 'node:fs';
import { PlatformType, VendorType, WrapperSessionInitConfig } from './wrapper';
import { getMachineId, hostname, systemName, systemVersion } from '@/common/utils/system';

export async function genSessionConfig(QQVersionAppid: string, QQVersion: string, selfUin: string, selfUid: string, account_path: string): Promise<WrapperSessionInitConfig> {
    const downloadPath = path.join(account_path, 'NapCat', 'temp');
    fs.mkdirSync(downloadPath, { recursive: true });
    const guid: string = await getMachineId();//26702 支持JS获取guid值 在LoginService中获取 TODO mlikiow a
    const config: WrapperSessionInitConfig = {
        selfUin,
        selfUid,
        desktopPathConfig: {
            account_path, // 可以通过NodeQQNTWrapperUtil().getNTUserDataInfoConfig()获取
        },
        clientVer: QQVersion,  // 9.9.8-22355
        a2: '',
        d2: '',
        d2Key: '',
        machineId: '',
        platform: PlatformType.KWINDOWS,  // 3是Windows?
        platVer: systemVersion,  // 系统版本号, 应该可以固定
        appid: QQVersionAppid,
        rdeliveryConfig: {
            appKey: '',
            systemId: 0,
            appId: '',
            logicEnvironment: '',
            platform: PlatformType.KWINDOWS,
            language: '',
            sdkVersion: '',
            userId: '',
            appVersion: '',
            osVersion: '',
            bundleId: '',
            serverUrl: '',
            fixedAfterHitKeys: [''],
        },
        defaultFileDownloadPath: downloadPath,
        deviceInfo: {
            guid,
            buildVer: QQVersion,
            localId: 2052,
            devName: hostname,
            devType: systemName,
            vendorName: '',
            osVer: systemVersion,
            vendorOsName: systemName,
            setMute: false,
            vendorType: VendorType.KNOSETONIOS,
        },
        deviceConfig: '{"appearance":{"isSplitViewMode":true},"msg":{}}',
    };
    return config;
}
