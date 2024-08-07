// --------------------
// 2024.7.3 9.9.12 BootWay.03 其余方法暂不公开（此方案为临时方案 Win平台已验证）

// 1.与非入侵式不同 现在破坏本体代码
// 2.重启代码与正常启动代码失效 
// 3.Win需要补丁
// 4.更新后丢失内容 需要重写此文件
// 5.安装难度上升与周围基础设施失效
// --------------------

const path = require('path');
const CurrentPath = path.dirname(__filename)
const hasNapcatParam = process.argv.includes('--enable-logging');
if (hasNapcatParam) {
    (async () => {
        await import("file://" + path.join(CurrentPath, './napcat/napcat.mjs'));
    })();
} else {
    require('./launcher.node').load('external_index', module);
}