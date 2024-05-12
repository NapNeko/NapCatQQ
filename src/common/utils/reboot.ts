import { exit } from "process";
import { resolve } from "path";
import { writeFile, writeFileSync } from "fs";
async function rebootWithQuickLogin(uin: string) {
    let batScript = resolve(__dirname, './napcat.bat');
    let batUtf8Script = resolve(__dirname, './napcat-utf8.bat');
    let bashScript = resolve(__dirname, './napcat.sh');
    if (process.platform === 'win32') {
        writeFileSync(resolve(__dirname, './reboot-utf8.bat'), `
        @echo off
        timeout /t 5 /nobreak
        start /b /wait %~dp0\\napcat-utf8.bat -q ${uin}
        `);
         // 启动cmd执行脚本
         
    } else if (process.platform === 'linux') {
        writeFileSync(resolve(__dirname, './reboot.sh'), `
        #!/bin/bash
        timeout 5
        ./napcat-utf8.sh -q ${uin}
        `);
        // 启动bash执行脚本
        


    }
    exit(0);
}