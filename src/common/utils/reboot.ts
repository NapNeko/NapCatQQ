import { exit } from "process";
import { resolve } from "path";
import { spawn } from "node:child_process";
import { sleep } from "./helper";

export async function rebootWithQuickLogin(uin: string) {
    let batScript = resolve(__dirname, './napcat.bat');
    let batUtf8Script = resolve(__dirname, './napcat-utf8.bat');
    let bashScript = resolve(__dirname, './napcat.sh');
    if (process.platform === 'win32') {
        let subProcess = spawn(`start ${batUtf8Script} -q ${uin}`, { detached: true, windowsHide: false, env: process.env, shell: true, stdio: 'ignore'});
        subProcess.unref();
    } else if (process.platform === 'linux') {
        let subProcess = spawn(`${bashScript} -q ${uin}`, { detached: true, windowsHide: false, env: process.env, shell: true, stdio: 'ignore' });
        subProcess.unref();
    }
    exit(0);
}
export async function rebootWithNormolLogin() {
    let batScript = resolve(__dirname, './napcat.bat');
    let batUtf8Script = resolve(__dirname, './napcat-utf8.bat');
    let bashScript = resolve(__dirname, './napcat.sh');
    if (process.platform === 'win32') {
        spawn(`start ${batUtf8Script}`, { detached: true, windowsHide: false, env: process.env, shell: true });
    } else if (process.platform === 'linux') {
        spawn(`${bashScript}`, { detached: true, windowsHide: false, env: process.env, shell: true });
    }
    await sleep(500);
    exit(0);
}