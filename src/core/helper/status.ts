import os from "node:os";
import EventEmitter from "node:events";

export interface SystemStatus {
    cpu: {
        model: string,
        speed: string
        usage: {
            system: string
            qq: string
        },
        core: number
    },
    memory: {
        total: string
        usage: {
            system: string
            qq: string
        }
    },
}

export class StatusHelper {
    private currentUsage = process.cpuUsage();
    private currentTime = process.hrtime();

    private get sysCpuInfo() {
        const { total, active } = os.cpus().map(cpu => {
            const times = cpu.times;
            const total = times.user + times.nice + times.sys + times.idle + times.irq;
            const active = total - times.idle;
            return { total, active };
        }).reduce((acc, cur) => ({
            total: acc.total + cur.total,
            active: acc.active + cur.active
        }), { total: 0, active: 0 });
        return {
            usage: ((active / total) * 100).toFixed(2),
            model: os.cpus()[0].model,
            speed: os.cpus()[0].speed,
            core: os.cpus().length
        };
    }

    private get sysMemoryUsage() {
        const { total, free } = { total: os.totalmem(), free: os.freemem() };
        return ((total - free) / 1024 / 1024).toFixed(2);
    }

    private qqUsage() {
        const mem = process.memoryUsage();
        const numCpus = os.cpus().length;
        const usageDiff = process.cpuUsage(this.currentUsage);
        const endTime = process.hrtime(this.currentTime);
        this.currentUsage = process.cpuUsage();
        this.currentTime = process.hrtime();
        const usageMS = (usageDiff.user + usageDiff.system) / 1e3;
        const totalMS = endTime[0] * 1e3 + endTime[1] / 1e6;
        const normPercent = (usageMS / totalMS / numCpus) * 100;
        return {
            cpu: normPercent.toFixed(2),
            memory: ((mem.heapTotal + mem.external + mem.arrayBuffers) / 1024 / 1024).toFixed(2)
        };
    }

    systemStatus(): SystemStatus {
        const qqUsage = this.qqUsage();
        return {
            cpu: {
                core: this.sysCpuInfo.core,
                model: this.sysCpuInfo.model,
                speed: (this.sysCpuInfo.speed / 1000).toFixed(2),
                usage: {
                    system: this.sysCpuInfo.usage,
                    qq: qqUsage.cpu
                },
            },
            memory: {
                total: (os.totalmem() / 1024 / 1024).toFixed(2),
                usage: {
                    system: this.sysMemoryUsage,
                    qq: qqUsage.memory
                }
            },
        };
    }
}

class StatusHelperSubscription extends EventEmitter {
    private statusHelper: StatusHelper;
    private interval: NodeJS.Timeout | null = null;

    constructor(time: number = 3000) {
        super();
        this.statusHelper = new StatusHelper();
        this.on('newListener', (event: string) => {
            if (event === 'statusUpdate' && this.listenerCount('statusUpdate') === 0) {
                this.startInterval(time);
            }
        });
        this.on('removeListener', (event: string) => {
            if (event === 'statusUpdate' && this.listenerCount('statusUpdate') === 0) {
                this.stopInterval();
            }
        });
    }

    private startInterval(time: number) {
        this.interval ??= setInterval(() => {
            const status = this.statusHelper.systemStatus();
            this.emit('statusUpdate', status);
        }, time);
    }

    private stopInterval() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

export const statusHelperSubscription = new StatusHelperSubscription();
