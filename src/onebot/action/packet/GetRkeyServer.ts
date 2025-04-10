import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';

export class GetRkeyServer extends GetPacketStatusDepends<void, { private_rkey?: string; group_rkey?: string; expired_time?: number; name: string }> {
    override actionName = ActionName.GetRkeyServer;

    private rkeyCache: {
        private_rkey?: string;
        group_rkey?: string;
        expired_time?: number;
        name: string;
    } | null = null;
    private expiryTime: number | null = null;

    async _handle() {
        // 检查缓存是否有效
        if (this.expiryTime && this.expiryTime > Math.floor(Date.now() / 1000) && this.rkeyCache) {
            return this.rkeyCache;
        }

        // 获取新的 Rkey
        let rkeys = await this.core.apis.PacketApi.pkt.operation.FetchRkey();
        let privateRkeyItem = rkeys.filter(rkey => rkey.type === 10)[0];
        let groupRkeyItem = rkeys.filter(rkey => rkey.type === 20)[0];

        this.expiryTime = Math.floor(Date.now() / 1000) + Math.min(+groupRkeyItem!.ttl.toString(),+privateRkeyItem!.ttl.toString());

        // 更新缓存
        this.rkeyCache = {
            private_rkey: privateRkeyItem ? privateRkeyItem.rkey : undefined,
            group_rkey: groupRkeyItem ? groupRkeyItem.rkey : undefined,
            expired_time: this.expiryTime,
            name: "NapCat 4"
        };

        return this.rkeyCache;
    }
}