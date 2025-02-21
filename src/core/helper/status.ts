import os from 'node:os';
import EventEmitter from 'node:events';

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
    arch: string
}

export class StatusHelper {
    private psCpuUsage = process.cpuUsage();
    private psCurrentTime = process.hrtime();
    private cpuTimes = os.cpus().map(cpu => cpu.times);

    private replaceNaN(value: number) {
        return isNaN(value) ? 0 : value;
    }

    private sysCpuInfo() {
        const currentTimes = os.cpus().map(cpu => cpu.times);
        const { total, active } = currentTimes.map((times, index) => {
            const prevTimes = this.cpuTimes[index];
            const totalCurrent = times.user + times.nice + times.sys + times.idle + times.irq;
            const totalPrev = (prevTimes?.user ?? 0) + (prevTimes?.nice ?? 0) + (prevTimes?.sys ?? 0) + (prevTimes?.idle ?? 0) + (prevTimes?.irq ?? 0);
            const activeCurrent = totalCurrent - times.idle;
            const activePrev = totalPrev - (prevTimes?.idle ?? 0);
            return {
                total: totalCurrent - totalPrev,
                active: activeCurrent - activePrev
            };
        }).reduce((acc, cur) => ({
            total: acc.total + cur.total,
            active: acc.active + cur.active
        }), { total: 0, active: 0 });
        this.cpuTimes = currentTimes;
        return {
            usage: this.replaceNaN(((active / total) * 100)).toFixed(2),
            model: os.cpus()[0]?.model ?? 'none',
            speed: os.cpus()[0]?.speed ?? 0,
            core: os.cpus().length
        };
    }

    private sysMemoryUsage() {
        const { total, free } = { total: os.totalmem(), free: os.freemem() };
        return ((total - free) / 1024 / 1024).toFixed(2);
    }

    private qqUsage() {
        const mem = process.memoryUsage();
        const numCpus = os.cpus().length;
        const usageDiff = process.cpuUsage(this.psCpuUsage);
        const endTime = process.hrtime(this.psCurrentTime);
        this.psCpuUsage = process.cpuUsage();
        this.psCurrentTime = process.hrtime();
        const usageMS = (usageDiff.user + usageDiff.system) / 1e3;
        const totalMS = endTime[0] * 1e3 + endTime[1] / 1e6;
        const normPercent = (usageMS / totalMS / numCpus) * 100;
        return {
            cpu: this.replaceNaN(normPercent).toFixed(2),
            memory: ((mem.heapTotal + mem.external + mem.arrayBuffers) / 1024 / 1024).toFixed(2)
        };
    }

    systemStatus(): SystemStatus {
        const qqUsage = this.qqUsage();
        const sysCpuInfo = this.sysCpuInfo();
        return {
            cpu: {
                core: sysCpuInfo.core,
                model: sysCpuInfo.model,
                speed: (sysCpuInfo.speed / 1000).toFixed(2),
                usage: {
                    system: sysCpuInfo.usage,
                    qq: qqUsage.cpu
                },
            },
            memory: {
                total: (os.totalmem() / 1024 / 1024).toFixed(2),
                usage: {
                    system: this.sysMemoryUsage(),
                    qq: qqUsage.memory
                }
            },
            arch: `${os.platform()} ${os.arch()} ${os.release()}`
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
