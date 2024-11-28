import * as os from 'os';
import offset from '@/core/external/offset.json';
import { InstanceContext, NapCatCore } from "@/core";
import { LogWrapper } from "@/common/log";
import { PacketClientSession } from "@/core/packet/clientSession";
import { napCatVersion } from "@/common/version";

interface OffsetType {
    [key: string]: {
        recv: string;
        send: string;
    };
}

const typedOffset: OffsetType = offset;

export class NTQQPacketApi {
    context: InstanceContext;
    core: NapCatCore;
    logger: LogWrapper;
    qqVersion: string | undefined;
    pkt!: PacketClientSession;
    errStack: string[] = [];

    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
        this.logger = core.context.logger;
    }
    async initApi() {
        await this.InitSendPacket(this.context.basicInfoWrapper.getFullQQVesion())
            .then()
            .catch((err) => {
                this.logger.logError(err);
                this.errStack.push(err);
            });
    }
    get available(): boolean {
        return this.pkt?.available ?? false;
    }

    get clientLogStack() {
        return this.pkt?.clientLogStack + '\n' + this.errStack.join('\n');
    }

    async InitSendPacket(qqVer: string) {
        this.qqVersion = qqVer;
        const table = typedOffset[qqVer + '-' + os.arch()];
        if (!table) {
            const err = `[Core] [Packet] PacketBackend 不支持当前QQ版本架构：${qqVer}-${os.arch()}，
            请参照 https://github.com/NapNeko/NapCatQQ/releases/tag/v${napCatVersion} 配置正确的QQ版本！`;
            this.logger.logError(err);
            this.errStack.push(err);
            return false;
        }
        if (this.core.configLoader.configData.packetBackend === 'disable') {
            const err = '[Core] [Packet] 已禁用PacketBackend，NapCat.Packet将不会加载！';
            this.logger.logError(err);
            this.errStack.push(err);
            return false;
        }
        this.pkt = new PacketClientSession(this.core);
        await this.pkt.init(process.pid, table.recv, table.send);
        return true;
    }
}
