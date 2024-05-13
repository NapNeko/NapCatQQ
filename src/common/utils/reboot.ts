import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { pid, ppid, exit } from 'node:process';
export async function rebootWithQuickLogin(uin: string) {
    let batScript = resolve(__dirname, './napcat.bat');
    let batUtf8Script = resolve(__dirname, './napcat-utf8.bat');
    let bashScript = resolve(__dirname, './napcat.sh');
    if (process.platform === 'win32') {
        const subProcess = spawn(`start ${batUtf8Script} -q ${uin}`, { detached: true, windowsHide: false, env: process.env, shell: true, stdio: 'ignore' });
        subProcess.unref();
        // 子父进程一起送走 有点效果
        spawn('cmd /c taskkill /t /f /pid ' + pid.toString(), { detached: true, shell: true, stdio: 'ignore' });
        spawn('cmd /c taskkill /t /f /pid ' + ppid.toString(), { detached: true, shell: true, stdio: 'ignore' });
    } else if (process.platform === 'linux') {
        const subProcess = spawn(`${bashScript} -q ${uin}`, { detached: true, windowsHide: false, env: process.env, shell: true, stdio: 'ignore' });
        //还没兼容
        subProcess.unref();
        exit(0);
    }
    //exit(0);
}
export async function rebootWithNormolLogin() {
    let batScript = resolve(__dirname, './napcat.bat');
    let batUtf8Script = resolve(__dirname, './napcat-utf8.bat');
    let bashScript = resolve(__dirname, './napcat.sh');
    if (process.platform === 'win32') {
        const subProcess = spawn(`start ${batUtf8Script} -q ${uin}`, { detached: true, windowsHide: false, env: process.env, shell: true, stdio: 'ignore' });
        subProcess.unref();
        // 子父进程一起送走 有点效果
        spawn('cmd /c taskkill /t /f /pid ' + pid.toString(), { detached: true, shell: true, stdio: 'ignore' });
        spawn('cmd /c taskkill /t /f /pid ' + ppid.toString(), { detached: true, shell: true, stdio: 'ignore' });
    } else if (process.platform === 'linux') {
        const subProcess = spawn(`${bashScript}`, { detached: true, windowsHide: false, env: process.env, shell: true });
        subProcess.unref();
        exit(0);
    }
}