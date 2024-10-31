const { ipcMain } = require('electron');
const napcat = require('../napcat.cjs');


ipcMain.handle('napcat_group_poke', async (event, { messageId, groupName }) => {
    const framework = await napcat.napcatFramework;
    const groups = await framework.core.apis.GroupApi.groupCache;
    const matchingGroups = Array.from(groups.values()).filter(group => group.groupName === groupName);

    for (const group of matchingGroups) {
        const { msgList } = await framework.core.apis.MsgApi.getMsgsByMsgId({
            peerUid: group.groupCode,
            chatType: 2
        }, [messageId]);
        if (msgList) {
            await framework.core.apis.PacketApi.sendPokePacket(+(msgList[0].senderUin), +group.groupCode);
            break;
        }
    }
});
