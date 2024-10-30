const { contextBridge } = require('electron');
const { ipcRenderer } = require('electron');

const napcat = {
    getWebUiUrl: async () => {
        return ipcRenderer.invoke('napcat_get_webtoken');
    },
    groupPoke: async (groupName, messageId) =>{
        return ipcRenderer.invoke('napcat_group_poke', {groupName, messageId});
    }
};
// 在window对象下导出只读对象
contextBridge.exposeInMainWorld('napcat', napcat);
