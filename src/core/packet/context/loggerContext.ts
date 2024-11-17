import { LogLevel, LogWrapper } from "@/common/log";
import { PacketContext } from "@/core/packet/context/packetContext";

// TODO: check bind?
export class PacketLogger {
    private readonly napLogger: LogWrapper;

    constructor(context: PacketContext) {
        this.napLogger = context.napcore.logger;
    }

    private _log(level: LogLevel, ...msg: any[]): void {
        this.napLogger._log(level, "[Core] [Packet] " + msg);
    }

    debug(...msg: any[]): void {
        this._log(LogLevel.DEBUG, msg);
    }

    info(...msg: any[]): void {
        this._log(LogLevel.INFO, msg);
    }

    warn(...msg: any[]): void {
        this._log(LogLevel.WARN, msg);
    }

    error(...msg: any[]): void {
        this._log(LogLevel.ERROR, msg);
    }

    fatal(...msg: any[]): void {
        this._log(LogLevel.FATAL, msg);
    }
}
