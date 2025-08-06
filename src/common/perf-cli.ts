#!/usr/bin/env node

/**
 * 性能监控命令行工具
 */

import { performanceMonitor } from '../common/performance-monitor';

function printColoredText(text: string, color: string): void {
    const colors: Record<string, string> = {
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        reset: '\x1b[0m',
        bright: '\x1b[1m'
    };
    
    console.log(`${colors[color] || colors['white']}${text}${colors['reset']}`);
}

function printHeader(title: string): void {
    const line = '='.repeat(50);
    printColoredText(line, 'cyan');
    printColoredText(title.toUpperCase().padStart((50 + title.length) / 2), 'bright');
    printColoredText(line, 'cyan');
}

function printSubHeader(title: string): void {
    const line = '-'.repeat(30);
    printColoredText(line, 'yellow');
    printColoredText(title, 'yellow');
    printColoredText(line, 'yellow');
}

function formatTime(ms: number): string {
    if (ms < 1) {
        return `${(ms * 1000).toFixed(2)}μs`;
    } else if (ms < 1000) {
        return `${ms.toFixed(2)}ms`;
    } else {
        return `${(ms / 1000).toFixed(2)}s`;
    }
}

function printStatsTable(stats: any[], title: string): void {
    printSubHeader(`${title} (Top 10)`);
    
    if (stats.length === 0) {
        printColoredText('  暂无数据', 'yellow');
        return;
    }
    
    console.log();
    console.log('  排名 | 函数名称 | 调用次数 | 总耗时 | 平均耗时 | 最小耗时 | 最大耗时');
    console.log('  ' + '-'.repeat(100));
    
    stats.slice(0, 10).forEach((stat, index) => {
        const rank = (index + 1).toString().padEnd(4);
        const name = stat.name.length > 30 ? stat.name.substring(0, 27) + '...' : stat.name.padEnd(30);
        const callCount = stat.callCount.toString().padEnd(8);
        const totalTime = formatTime(stat.totalTime).padEnd(10);
        const avgTime = formatTime(stat.averageTime).padEnd(10);
        const minTime = formatTime(stat.minTime).padEnd(10);
        const maxTime = formatTime(stat.maxTime).padEnd(10);
        
        const color = index < 3 ? 'green' : 'white';
        printColoredText(
            `  ${rank} | ${name} | ${callCount} | ${totalTime} | ${avgTime} | ${minTime} | ${maxTime}`,
            color
        );
    });
    
    console.log();
}

function printSummary(): void {
    const stats = performanceMonitor.getStats();
    const totalFunctions = stats.length;
    const totalCalls = stats.reduce((sum, stat) => sum + stat.callCount, 0);
    const totalTime = stats.reduce((sum, stat) => sum + stat.totalTime, 0);
    const avgTimePerCall = totalCalls > 0 ? totalTime / totalCalls : 0;
    
    printSubHeader('📊 统计摘要');
    console.log();
    printColoredText(`  监控函数数量: ${totalFunctions}`, 'cyan');
    printColoredText(`  总调用次数: ${totalCalls}`, 'cyan');
    printColoredText(`  总耗时: ${formatTime(totalTime)}`, 'cyan');
    printColoredText(`  平均每次调用耗时: ${formatTime(avgTimePerCall)}`, 'cyan');
    console.log();
}

function main(): void {
    const args = process.argv.slice(2);
    const command = args[0] || 'report';
    
    switch (command) {
        case 'report':
        case 'r':
            printHeader('🚀 NapCat 性能监控报告');
            console.log();
            
            printSummary();
            
            const totalTimeStats = performanceMonitor.getTopByTotalTime(10);
            const callCountStats = performanceMonitor.getTopByCallCount(10);
            const avgTimeStats = performanceMonitor.getTopByAverageTime(10);
            
            printStatsTable(totalTimeStats, '🔥 总耗时排行榜');
            printStatsTable(callCountStats, '📈 调用次数排行榜');
            printStatsTable(avgTimeStats, '⏱️ 平均耗时排行榜');
            
            break;
            
        case 'top':
        case 't':
            const type = args[1] || 'total';
            const limit = parseInt(args[2] || '10') || 10;
            
            switch (type) {
                case 'total':
                case 'time':
                    printHeader('🔥 总耗时排行榜');
                    printStatsTable(performanceMonitor.getTopByTotalTime(limit), '');
                    break;
                case 'count':
                case 'calls':
                    printHeader('📈 调用次数排行榜');
                    printStatsTable(performanceMonitor.getTopByCallCount(limit), '');
                    break;
                case 'avg':
                case 'average':
                    printHeader('⏱️ 平均耗时排行榜');
                    printStatsTable(performanceMonitor.getTopByAverageTime(limit), '');
                    break;
                default:
                    printColoredText('未知的排行榜类型。可用类型: total, count, avg', 'red');
            }
            break;
            
        case 'clear':
        case 'c':
            performanceMonitor.clear();
            printColoredText('✅ 性能统计数据已清空', 'green');
            break;
            
        case 'json':
        case 'j':
            const jsonStats = performanceMonitor.toJSON();
            console.log(JSON.stringify(jsonStats, null, 2));
            break;
            
        case 'help':
        case 'h':
        case '--help':
            printHelp();
            break;
            
        default:
            printColoredText(`未知命令: ${command}`, 'red');
            printHelp();
            process.exit(1);
    }
}

function printHelp(): void {
    printHeader('📖 帮助信息');
    console.log();
    printColoredText('用法: napcat-perf <command> [options]', 'cyan');
    console.log();
    printColoredText('命令:', 'yellow');
    console.log('  report, r              显示完整性能报告 (默认)');
    console.log('  top <type> [limit]     显示指定类型的排行榜');
    console.log('    - total, time        按总耗时排序');
    console.log('    - count, calls       按调用次数排序');
    console.log('    - avg, average       按平均耗时排序');
    console.log('  clear, c               清空所有统计数据');
    console.log('  json, j                以JSON格式输出数据');
    console.log('  help, h                显示此帮助信息');
    console.log();
    printColoredText('示例:', 'yellow');
    console.log('  napcat-perf report');
    console.log('  napcat-perf top total 20');
    console.log('  napcat-perf top count');
    console.log('  napcat-perf clear');
    console.log();
}

// 如果直接运行此文件
if (require.main === module) {
    main();
}

export { main as runPerfMonitor };
