import { exit } from "process";
import { resolve } from "path";
async function reboot() {
    let batScript = resolve(__dirname, './napcat.bat');
    let batUtf8Script = resolve(__dirname, './napcat-utf8.bat');
    let bashScript = resolve(__dirname, './napcat.sh');
    //如果是win系统写出 5s延迟启动 默认batUtf8Script启动
    // 如果是linux系统写出 5s延迟启动 默认bashScript启动
    if (process.platform === 'win32') {
        // console.log('正在重启...');
    } else if (process.platform === 'linux') {
        //console.log('正在重启...');
    }
    exit(0);
}