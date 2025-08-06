/**
 * 性能监控器 - 用于统计函数调用次数、耗时等信息
 */

import * as fs from 'fs';
import * as path from 'path';

export interface FunctionStats {
    name: string;
    callCount: number;
    totalTime: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
    fileName?: string;
    lineNumber?: number;
}

export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private stats = new Map<string, FunctionStats>();
    private startTimes = new Map<string, number>();
    private reportInterval: NodeJS.Timeout | null = null;

    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
            // 启动定时统计报告
            PerformanceMonitor.instance.startPeriodicReport();
        }
        return PerformanceMonitor.instance;
    }

    /**
     * 开始定时统计报告 (每60秒)
     */
    private startPeriodicReport(): void {
        if (this.reportInterval) {
            clearInterval(this.reportInterval);
        }

        this.reportInterval = setInterval(() => {
            if (this.stats.size > 0) {
                this.printPeriodicReport();
                this.writeDetailedLogToFile();
            }
        }, 60000); // 60秒
    }

    /**
     * 停止定时统计报告
     */
    stopPeriodicReport(): void {
        if (this.reportInterval) {
            clearInterval(this.reportInterval);
            this.reportInterval = null;
        }
    }

    /**
     * 打印定时统计报告 (简化版本)
     */
    private printPeriodicReport(): void {
        const now = new Date().toLocaleString();
        console.log(`\n=== 性能监控定时报告 [${now}] ===`);

        const totalFunctions = this.stats.size;
        const totalCalls = Array.from(this.stats.values()).reduce((sum, stat) => sum + stat.callCount, 0);
        const totalTime = Array.from(this.stats.values()).reduce((sum, stat) => sum + stat.totalTime, 0);

        console.log(`📊 总览: ${totalFunctions} 个函数, ${totalCalls} 次调用, 总耗时: ${totalTime.toFixed(2)}ms`);

        // 显示Top 5最活跃的函数
        console.log('\n🔥 最活跃函数 (Top 5):');
        this.getTopByCallCount(5).forEach((stat, index) => {
            console.log(`${index + 1}. ${stat.name} - 调用: ${stat.callCount}次, 总耗时: ${stat.totalTime.toFixed(2)}ms`);
        });

        // 显示Top 5最耗时的函数
        console.log('\n⏱️ 最耗时函数 (Top 5):');
        this.getTopByTotalTime(5).forEach((stat, index) => {
            console.log(`${index + 1}. ${stat.name} - 总耗时: ${stat.totalTime.toFixed(2)}ms, 平均: ${stat.averageTime.toFixed(2)}ms`);
        });

        console.log('===============================\n');
    }

    /**
     * 将详细统计数据写入日志文件
     */
    private writeDetailedLogToFile(): void {
        try {
            const now = new Date();
            const dateStr = now.toISOString().replace(/[:.]/g, '-').split('T')[0];
            const timeStr = now.toTimeString().split(' ')[0]?.replace(/:/g, '-') || 'unknown-time';
            const timestamp = `${dateStr}_${timeStr}`;
            const fileName = `${timestamp}.log.txt`;
            const logPath = path.join(process.cwd(), 'logs', fileName);

            // 确保logs目录存在
            const logsDir = path.dirname(logPath);
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }

            const totalFunctions = this.stats.size;
            const totalCalls = Array.from(this.stats.values()).reduce((sum, stat) => sum + stat.callCount, 0);
            const totalTime = Array.from(this.stats.values()).reduce((sum, stat) => sum + stat.totalTime, 0);

            let logContent = '';
            logContent += `=== 性能监控详细报告 ===\n`;
            logContent += `生成时间: ${now.toLocaleString()}\n`;
            logContent += `统计周期: 60秒\n`;
            logContent += `总览: ${totalFunctions} 个函数, ${totalCalls} 次调用, 总耗时: ${totalTime.toFixed(2)}ms\n\n`;

            // 详细函数统计
            logContent += `=== 所有函数详细统计 ===\n`;
            const allStats = this.getStats().sort((a, b) => b.totalTime - a.totalTime);
            
            allStats.forEach((stat, index) => {
                logContent += `${index + 1}. 函数: ${stat.name}\n`;
                logContent += `   文件: ${stat.fileName || 'N/A'}\n`;
                logContent += `   行号: ${stat.lineNumber || 'N/A'}\n`;
                logContent += `   调用次数: ${stat.callCount}\n`;
                logContent += `   总耗时: ${stat.totalTime.toFixed(4)}ms\n`;
                logContent += `   平均耗时: ${stat.averageTime.toFixed(4)}ms\n`;
                logContent += `   最小耗时: ${stat.minTime === Infinity ? 'N/A' : stat.minTime.toFixed(4)}ms\n`;
                logContent += `   最大耗时: ${stat.maxTime.toFixed(4)}ms\n`;
                logContent += `   性能占比: ${((stat.totalTime / totalTime) * 100).toFixed(2)}%\n`;
                logContent += `\n`;
            });

            // 排行榜统计
            logContent += `=== 总耗时排行榜 (Top 20) ===\n`;
            this.getTopByTotalTime(20).forEach((stat, index) => {
                logContent += `${index + 1}. ${stat.name} - 总耗时: ${stat.totalTime.toFixed(2)}ms, 调用: ${stat.callCount}次, 平均: ${stat.averageTime.toFixed(2)}ms\n`;
            });

            logContent += `\n=== 调用次数排行榜 (Top 20) ===\n`;
            this.getTopByCallCount(20).forEach((stat, index) => {
                logContent += `${index + 1}. ${stat.name} - 调用: ${stat.callCount}次, 总耗时: ${stat.totalTime.toFixed(2)}ms, 平均: ${stat.averageTime.toFixed(2)}ms\n`;
            });

            logContent += `\n=== 平均耗时排行榜 (Top 20) ===\n`;
            this.getTopByAverageTime(20).forEach((stat, index) => {
                logContent += `${index + 1}. ${stat.name} - 平均: ${stat.averageTime.toFixed(2)}ms, 调用: ${stat.callCount}次, 总耗时: ${stat.totalTime.toFixed(2)}ms\n`;
            });

            logContent += `\n=== 性能热点分析 ===\n`;
            // 找出最耗时的前10个函数
            const hotSpots = this.getTopByTotalTime(10);
            hotSpots.forEach((stat, index) => {
                const efficiency = stat.callCount / stat.totalTime; // 每毫秒的调用次数
                logContent += `${index + 1}. ${stat.name}\n`;
                logContent += `   性能影响: ${((stat.totalTime / totalTime) * 100).toFixed(2)}%\n`;
                logContent += `   调用效率: ${efficiency.toFixed(4)} 调用/ms\n`;
                logContent += `   优化建议: ${stat.averageTime > 10 ? '考虑优化此函数的执行效率' : 
                                           stat.callCount > 1000 ? '考虑减少此函数的调用频率' : 
                                           '性能表现良好'}\n\n`;
            });

            logContent += `=== 报告结束 ===\n`;

            // 写入文件
            fs.writeFileSync(logPath, logContent, 'utf8');
            console.log(`📄 详细性能报告已保存到: ${logPath}`);

        } catch (error) {
            console.error('写入性能日志文件时出错:', error);
        }
    }

    /**
     * 开始记录函数调用
     */
    startFunction(functionName: string, fileName?: string, lineNumber?: number): string {
        const callId = `${functionName}_${Date.now()}_${Math.random()}`;
        this.startTimes.set(callId, performance.now());

        // 初始化或更新统计信息
        if (!this.stats.has(functionName)) {
            this.stats.set(functionName, {
                name: functionName,
                callCount: 0,
                totalTime: 0,
                averageTime: 0,
                minTime: Infinity,
                maxTime: 0,
                fileName,
                lineNumber
            });
        }

        const stat = this.stats.get(functionName)!;
        stat.callCount++;

        return callId;
    }

    /**
     * 结束记录函数调用
     */
    endFunction(callId: string, functionName: string): void {
        const startTime = this.startTimes.get(callId);
        if (!startTime) return;

        const endTime = performance.now();
        const duration = endTime - startTime;

        this.startTimes.delete(callId);

        const stat = this.stats.get(functionName);
        if (!stat) return;

        stat.totalTime += duration;
        stat.averageTime = stat.totalTime / stat.callCount;
        stat.minTime = Math.min(stat.minTime, duration);
        stat.maxTime = Math.max(stat.maxTime, duration);
    }

    /**
     * 获取所有统计信息
     */
    getStats(): FunctionStats[] {
        return Array.from(this.stats.values());
    }

    /**
     * 获取排行榜 - 按总耗时排序
     */
    getTopByTotalTime(limit = 20): FunctionStats[] {
        return this.getStats()
            .sort((a, b) => b.totalTime - a.totalTime)
            .slice(0, limit);
    }

    /**
     * 获取排行榜 - 按调用次数排序
     */
    getTopByCallCount(limit = 20): FunctionStats[] {
        return this.getStats()
            .sort((a, b) => b.callCount - a.callCount)
            .slice(0, limit);
    }

    /**
     * 获取排行榜 - 按平均耗时排序
     */
    getTopByAverageTime(limit = 20): FunctionStats[] {
        return this.getStats()
            .sort((a, b) => b.averageTime - a.averageTime)
            .slice(0, limit);
    }

    /**
     * 清空统计数据
     */
    clear(): void {
        this.stats.clear();
        this.startTimes.clear();
    }

    /**
     * 打印统计报告
     */
    printReport(): void {
        console.log('\n=== 函数性能监控报告 ===');

        console.log('\n🔥 总耗时排行榜 (Top 10):');
        this.getTopByTotalTime(10).forEach((stat, index) => {
            console.log(`${index + 1}. ${stat.name} - 总耗时: ${stat.totalTime.toFixed(2)}ms, 调用次数: ${stat.callCount}, 平均耗时: ${stat.averageTime.toFixed(2)}ms`);
        });

        console.log('\n📈 调用次数排行榜 (Top 10):');
        this.getTopByCallCount(10).forEach((stat, index) => {
            console.log(`${index + 1}. ${stat.name} - 调用次数: ${stat.callCount}, 总耗时: ${stat.totalTime.toFixed(2)}ms, 平均耗时: ${stat.averageTime.toFixed(2)}ms`);
        });

        console.log('\n⏱️ 平均耗时排行榜 (Top 10):');
        this.getTopByAverageTime(10).forEach((stat, index) => {
            console.log(`${index + 1}. ${stat.name} - 平均耗时: ${stat.averageTime.toFixed(2)}ms, 调用次数: ${stat.callCount}, 总耗时: ${stat.totalTime.toFixed(2)}ms`);
        });

        console.log('\n========================\n');
    }

    /**
     * 获取JSON格式的统计数据
     */
    toJSON(): FunctionStats[] {
        return this.getStats();
    }
}

// 全局性能监控器实例
export const performanceMonitor = PerformanceMonitor.getInstance();

// 在进程退出时打印报告并停止定时器
if (typeof process !== 'undefined') {
    process.on('exit', () => {
        performanceMonitor.stopPeriodicReport();
        performanceMonitor.printReport();
    });

    process.on('SIGINT', () => {
        performanceMonitor.stopPeriodicReport();
        performanceMonitor.printReport();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        performanceMonitor.stopPeriodicReport();
        performanceMonitor.printReport();
        process.exit(0);
    });
}
