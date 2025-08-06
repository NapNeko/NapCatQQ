/**
 * 性能监控API - 提供HTTP接口查看性能统计
 */
import { Router, Request, Response } from 'express';
import { performanceMonitor } from '@/common/performance-monitor';

export function createPerformanceRouter(): Router {
    const router = Router();

    // 获取所有统计数据
    router.get('/stats', (_req: Request, res: Response) => {
        try {
            const stats = performanceMonitor.getStats();
            res.json({
                success: true,
                data: stats,
                count: stats.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // 获取总耗时排行榜
    router.get('/stats/total-time', (req: Request, res: Response) => {
        try {
            const limit = parseInt(req.query['limit'] as string) || 20;
            const stats = performanceMonitor.getTopByTotalTime(limit);
            res.json({
                success: true,
                data: stats,
                count: stats.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // 获取调用次数排行榜
    router.get('/stats/call-count', (req: Request, res: Response) => {
        try {
            const limit = parseInt(req.query['limit'] as string) || 20;
            const stats = performanceMonitor.getTopByCallCount(limit);
            res.json({
                success: true,
                data: stats,
                count: stats.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // 获取平均耗时排行榜
    router.get('/stats/average-time', (req: Request, res: Response) => {
        try {
            const limit = parseInt(req.query['limit'] as string) || 20;
            const stats = performanceMonitor.getTopByAverageTime(limit);
            res.json({
                success: true,
                data: stats,
                count: stats.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // 清空统计数据
    router.post('/clear', (_req: Request, res: Response) => {
        try {
            performanceMonitor.clear();
            res.json({
                success: true,
                message: 'Performance statistics cleared'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // 获取性能报告页面
    router.get('/report', (_req: Request, res: Response) => {
        try {
            const totalTimeStats = performanceMonitor.getTopByTotalTime(10);
            const callCountStats = performanceMonitor.getTopByCallCount(10);
            const averageTimeStats = performanceMonitor.getTopByAverageTime(10);

            const html = generateReportHTML(totalTimeStats, callCountStats, averageTimeStats);
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.send(html);
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    return router;
}

function generateReportHTML(totalTimeStats: any[], callCountStats: any[], averageTimeStats: any[]): string {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NapCat 性能监控报告</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 30px;
        }
        .stats-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            border-left: 4px solid #667eea;
        }
        .stats-card h3 {
            margin: 0 0 15px;
            color: #667eea;
            display: flex;
            align-items: center;
        }
        .stats-card h3::before {
            content: '';
            width: 20px;
            height: 20px;
            margin-right: 10px;
            border-radius: 50%;
            background: #667eea;
        }
        .stats-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .stats-item {
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .stats-item:last-child {
            border-bottom: none;
        }
        .function-name {
            font-weight: 600;
            color: #495057;
            flex: 1;
            margin-right: 15px;
            word-break: break-all;
        }
        .stats-values {
            display: flex;
            gap: 15px;
            font-size: 0.9em;
        }
        .stat-value {
            text-align: center;
        }
        .stat-label {
            font-size: 0.8em;
            color: #6c757d;
            display: block;
        }
        .stat-number {
            font-weight: bold;
            color: #28a745;
        }
        .rank {
            background: #667eea;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9em;
            font-weight: bold;
            margin-right: 15px;
        }
        .refresh-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 50px;
            padding: 15px 20px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
        }
        .refresh-btn:hover {
            background: #5a6fd8;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
        }
        .clear-btn {
            background: #dc3545;
            margin-left: 10px;
        }
        .clear-btn:hover {
            background: #c82333;
        }
        @media (max-width: 768px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
            .stats-values {
                flex-direction: column;
                gap: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 NapCat 性能监控报告</h1>
            <p>实时函数调用性能统计 - ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="content">
            <div class="stats-grid">
                <div class="stats-card">
                    <h3>🔥 总耗时排行榜 (Top 10)</h3>
                    <ul class="stats-list">
                        ${totalTimeStats.map((stat, index) => `
                            <li class="stats-item">
                                <span class="rank">${index + 1}</span>
                                <span class="function-name">${stat.name}</span>
                                <div class="stats-values">
                                    <div class="stat-value">
                                        <span class="stat-number">${stat.totalTime.toFixed(2)}ms</span>
                                        <span class="stat-label">总耗时</span>
                                    </div>
                                    <div class="stat-value">
                                        <span class="stat-number">${stat.callCount}</span>
                                        <span class="stat-label">调用次数</span>
                                    </div>
                                    <div class="stat-value">
                                        <span class="stat-number">${stat.averageTime.toFixed(2)}ms</span>
                                        <span class="stat-label">平均耗时</span>
                                    </div>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <div class="stats-card">
                    <h3>📈 调用次数排行榜 (Top 10)</h3>
                    <ul class="stats-list">
                        ${callCountStats.map((stat, index) => `
                            <li class="stats-item">
                                <span class="rank">${index + 1}</span>
                                <span class="function-name">${stat.name}</span>
                                <div class="stats-values">
                                    <div class="stat-value">
                                        <span class="stat-number">${stat.callCount}</span>
                                        <span class="stat-label">调用次数</span>
                                    </div>
                                    <div class="stat-value">
                                        <span class="stat-number">${stat.totalTime.toFixed(2)}ms</span>
                                        <span class="stat-label">总耗时</span>
                                    </div>
                                    <div class="stat-value">
                                        <span class="stat-number">${stat.averageTime.toFixed(2)}ms</span>
                                        <span class="stat-label">平均耗时</span>
                                    </div>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <div class="stats-card">
                    <h3>⏱️ 平均耗时排行榜 (Top 10)</h3>
                    <ul class="stats-list">
                        ${averageTimeStats.map((stat, index) => `
                            <li class="stats-item">
                                <span class="rank">${index + 1}</span>
                                <span class="function-name">${stat.name}</span>
                                <div class="stats-values">
                                    <div class="stat-value">
                                        <span class="stat-number">${stat.averageTime.toFixed(2)}ms</span>
                                        <span class="stat-label">平均耗时</span>
                                    </div>
                                    <div class="stat-value">
                                        <span class="stat-number">${stat.callCount}</span>
                                        <span class="stat-label">调用次数</span>
                                    </div>
                                    <div class="stat-value">
                                        <span class="stat-number">${stat.totalTime.toFixed(2)}ms</span>
                                        <span class="stat-label">总耗时</span>
                                    </div>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <button class="refresh-btn" onclick="window.location.reload()">
        🔄 刷新数据
    </button>
    <button class="refresh-btn clear-btn" onclick="clearStats()">
        🗑️ 清空统计
    </button>

    <script>
        function clearStats() {
            if (confirm('确定要清空所有性能统计数据吗？')) {
                fetch('/performance/clear', {
                    method: 'POST'
                }).then(response => {
                    if (response.ok) {
                        alert('统计数据已清空');
                        window.location.reload();
                    } else {
                        alert('清空失败');
                    }
                }).catch(error => {
                    alert('清空失败: ' + error.message);
                });
            }
        }

        // 自动刷新
        setInterval(() => {
            window.location.reload();
        }, 30000); // 30秒自动刷新
    </script>
</body>
</html>
    `;
}
