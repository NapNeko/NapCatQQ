//LiteLoader需要提供部分IPC接口，以便于其他插件调用
const { ipcMain, BrowserWindow } = require('electron');
const napcat = require('./napcat.cjs');
const { shell } = require('electron');
ipcMain.handle('napcat_get_webui', async () => {
    return napcat.NCgetWebUiUrl();
});
ipcMain.on('open_external_url', (event, url) => {
    shell.openExternal(url);
});
ipcMain.on('napcat_open_inner_url', (event, url) => {
    const win = new BrowserWindow({
        autoHideMenuBar: true,
    });
    win.loadURL(url);
    win.webContents.setWindowOpenHandler(details => {
        win.loadURL(details.url)
    })
});