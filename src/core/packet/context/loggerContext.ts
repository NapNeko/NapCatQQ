/* eslint-disable @typescript-eslint/no-explicit-any */
import { LogLevel, LogWrapper } from '@/common/log';
import { NapCoreContext } from '@/core/packet/context/napCoreContext';

// TODO: check bind?
export class PacketLogger {
    private readonly napLogger: LogWrapper;

    constructor(napcore: NapCoreContext) {
        this.napLogger = napcore.logger;
    }

    private _log(level: LogLevel, ...msg: any[]): void {
        this.napLogger._log(level, '[Core] [Packet] ' + msg);
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
