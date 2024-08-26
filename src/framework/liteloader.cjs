//LiteLoader需要提供部分IPC接口，以便于其他插件调用
const { ipcMain } = require('electron');
const napcat = require('./napcat.cjs');
ipcMain.handle('napcat_get_webtoken', async (event, arg) => {
    return napcat.NCgetWebUiUrl();
});
