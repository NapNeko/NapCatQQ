const { ipcMain } = require('electron');
const napcat = require('../napcat.cjs');


ipcMain.handle('napcat_group_poke', async (event, { messageId, groupName }) => {
    const framework = await napcat.napcatFramework;
    const groups = await framework.core.apis.getGroups();
    for (const group of groups) {
        if (groupName === group.groupName) {
            const { msgList } = await framework.core.apis.getMsgsByMsgId({
                peerUid: group.groupCode,
                chatType: 2
            }, [messageId]);
            if (msgList) {
                framework.core.apis.PacketApi.sendPokePacket(msgList[0].senderUin, +group.groupCode);
                break;
            }
        }
    }
});
