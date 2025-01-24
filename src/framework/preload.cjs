const { contextBridge, ipcRenderer } = require('electron');
const napcat = {
    getWebUiUrl: async () => {
        return ipcRenderer.invoke('napcat_get_webui');
    },
    openExternalUrl: async (url) => {
        ipcRenderer.send('open_external_url', url);
    },
    openInnerUrl: async (url) => {
        ipcRenderer.send('napcat_open_inner_url', url);
    }
};
// 在window对象下导出只读对象
contextBridge.exposeInMainWorld('napcat', napcat);