const { contextBridge, ipcRenderer } = require('electron');
const napcat = {
    getWebUiUrl: async () => {
        return ipcRenderer.invoke('napcat_get_webtoken');
    },
    openExternalUrl: async (url) => {
        ipcRenderer.send('open_external_url', url);
    },
    getWebUiUrlReact: async () => {
        return ipcRenderer.invoke('napcat_get_reactweb');
    }
};
// 在window对象下导出只读对象
contextBridge.exposeInMainWorld('napcat', napcat);