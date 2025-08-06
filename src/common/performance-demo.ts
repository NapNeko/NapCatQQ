/**
 * 性能监控演示示例
 */

import { performanceMonitor } from './performance-monitor';

// 模拟一些函数调用来测试性能监控
class ExampleService {
    async fetchData(id: string): Promise<string> {
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        return `Data for ${id}`;
    }

    processData(data: string): string {
        // 模拟CPU密集型操作
        let result = data;
        for (let i = 0; i < 1000; i++) {
            result = result.split('').reverse().join('');
        }
        return result;
    }

    async saveData(data: string): Promise<void> {
        // 模拟保存操作
        console.log(`保存数据: ${data.length} 字符`);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    }
}

// 工具函数
function calculateHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转换为32位整数
    }
    return hash.toString(16);
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 演示函数
export async function runPerformanceDemo(): Promise<void> {
    console.log('🚀 开始性能监控演示...\n');
    
    const service = new ExampleService();
    
    // 执行一些操作来生成性能数据
    for (let i = 0; i < 10; i++) {
        try {
            // 获取数据
            const data = await service.fetchData(`item-${i}`);
            
            // 处理数据
            const processed = service.processData(data);
            
            // 计算哈希
            const hash = calculateHash(processed);
            
            // 保存数据
            await service.saveData(`${processed}-${hash}`);
            
            console.log(`✅ 处理完成第 ${i + 1} 项`);
            
            // 随机延迟
            await delay(Math.random() * 20);
        } catch (error) {
            console.error(`❌ 处理第 ${i + 1} 项时出错:`, error);
        }
    }
    
    // 等待一小段时间确保所有异步操作完成
    await delay(100);
    
    console.log('\n📊 性能监控演示完成！');
    console.log('性能统计数据:');
    
    // 显示性能统计
    performanceMonitor.printReport();
}

// 如果直接运行此文件
if (require.main === module) {
    runPerformanceDemo().catch(console.error);
}
