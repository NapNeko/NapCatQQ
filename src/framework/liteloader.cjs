//LiteLoader需要提供部分IPC接口，以便于其他插件调用
const { ipcMain } = require('electron');
const fs = require('fs');
ipcMain.handle("napcat_get_webtoken", async (event, arg) => {
    return "http://127.0.0.1:6099/webui/?token=" + JSON.parse(fs.readFileSync(__dirname + '/config/webui.json', 'utf-8').toString()).token;
});
require('./napcat.cjs');