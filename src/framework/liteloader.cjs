//LiteLoader需要提供部分IPC接口，以便于其他插件调用
const { ipcMain, BrowserWindow } = require('electron');
const napcat = require('./napcat.cjs');
const { shell } = require('electron');
ipcMain.handle('napcat_get_webtoken', async (event, arg) => {
    return napcat.NCgetWebUiUrl();
});
ipcMain.on('open_external_url', (event, url) => {
    shell.openExternal(url);
});
ipcMain.handle('napcat_get_reactweb', async (event, arg) => {
    let url = new URL(await napcat.NCgetWebUiUrl());
    let port = url.port;
    let token = url.searchParams.get('token');
    return `https://napcat.152710.xyz/web_login?back=http://127.0.0.1:${port}&token=${token}`;
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