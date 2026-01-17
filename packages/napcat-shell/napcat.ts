import { NCoreInitShell } from './base';
import { NapCatPathWrapper } from '@/napcat-common/src/path';
import { LogWrapper } from '@/napcat-core/helper/log';
import { connectToNamedPipe } from './pipe';
import path from 'path';
import { fileURLToPath } from 'url';

// ES 模块中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 扩展 Process 类型以支持 parentPort
declare global {
  namespace NodeJS {
    interface Process {
      parentPort?: {
        on (event: 'message', listener: (e: { data: any; }) => void): void;
        postMessage (message: any): void;
      };
    }
  }
}

// 判断是否为子进程（通过环境变量）
const isWorkerProcess = process.env['NAPCAT_WORKER_PROCESS'] === '1';

// 只在主进程中导入 utilityProcess
let utilityProcess: any;
if (!isWorkerProcess) {
  // @ts-ignore - electron 运行时存在但类型声明可能缺失
  const electron = await import('electron');
  utilityProcess = electron.utilityProcess;
}

const pathWrapper = new NapCatPathWrapper();
const logger = new LogWrapper(pathWrapper.logsPath);

// 存储当前的 worker 进程引用
let currentWorker: any = null;

// 重启 worker 进程的函数
export async function restartWorker () {
  logger.log('[NapCat] [UtilityProcess] 正在重启Worker进程...');

  if (currentWorker) {
    const workerPid = currentWorker.pid;
    logger.log(`[NapCat] [UtilityProcess] 准备关闭Worker进程，PID: ${workerPid}`);

    // 发送关闭信号
    currentWorker.postMessage({ type: 'shutdown' });

    // 等待进程退出，最多等待 3 秒
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        logger.logWarn('[NapCat] [UtilityProcess] Worker进程未在 3 秒内退出，尝试强制终止');
        currentWorker.kill();
        resolve();
      }, 3000);

      currentWorker.once('exit', () => {
        clearTimeout(timeout);
        logger.log('[NapCat] [UtilityProcess] Worker进程已正常退出');
        resolve();
      });
    });

    // 检查进程是否真的被杀掉了
    if (workerPid) {
      logger.log(`[NapCat] [UtilityProcess] 检查进程 ${workerPid} 是否已终止...`);
      try {
        // 尝试发送信号 0 来检查进程是否存在
        process.kill(workerPid, 0);
        // 如果没有抛出异常，说明进程还在运行
        logger.logWarn(`[NapCat] [UtilityProcess] 进程 ${workerPid} 仍在运行，强制杀掉`);
        try {
          // Windows 使用 taskkill，Unix 使用 SIGKILL
          if (process.platform === 'win32') {
            const { execSync } = await import('child_process');
            execSync(`taskkill /F /PID ${workerPid} /T`, { stdio: 'ignore' });
          } else {
            process.kill(workerPid, 'SIGKILL');
          }
          logger.log(`[NapCat] [UtilityProcess] 已强制终止进程 ${workerPid}`);
        } catch (killError) {
          logger.logError(`[NapCat] [UtilityProcess] 强制终止进程失败:`, killError);
        }
      } catch (e) {
        // 抛出异常说明进程不存在，已经被成功杀掉
        logger.log(`[NapCat] [UtilityProcess] 进程 ${workerPid} 已确认终止`);
      }
    }

    // 进程结束后等待 3 秒再启动新进程
    logger.log('[NapCat] [UtilityProcess] Worker进程已关闭，等待 3 秒后启动新进程...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // 启动新的 worker 进程
  await startWorker();
  logger.log('[NapCat] [UtilityProcess] Worker进程重启完成');
}

async function startWorker () {
  // 创建 utility 进程
  // 根据实际构建产物确定文件扩展名
  const workerScript = __filename.endsWith('.mjs')
    ? path.join(__dirname, 'napcat.mjs')
    : path.join(__dirname, 'napcat.js');

  const child = utilityProcess.fork(workerScript, [], {
    env: {
      ...process.env,
      NAPCAT_WORKER_PROCESS: '1',
    },
    stdio: 'pipe',
  });

  currentWorker = child;
  logger.log('[NapCat] [UtilityProcess] 已创建Worker进程，PID:', child.pid);

  // 监听子进程标准输出 - 直接原始输出
  if (child.stdout) {
    child.stdout.on('data', (data: Buffer) => {
      process.stdout.write(data);
    });
  }

  // 监听子进程标准错误 - 直接原始输出
  if (child.stderr) {
    child.stderr.on('data', (data: Buffer) => {
      process.stderr.write(data);
    });
  }

  // 监听子进程消息
  child.on('message', (msg: any) => {
    logger.log('[NapCat] [UtilityProcess] 收到Worker消息:', msg);

    // 处理重启请求
    if (msg?.type === 'restart') {
      logger.log('[NapCat] [UtilityProcess] 收到重启请求，正在重启Worker进程...');
      restartWorker().catch(e => {
        logger.logError('[NapCat] [UtilityProcess] 重启Worker进程失败:', e);
      });
    }
  });

  // 监听子进程退出
  child.on('exit', (code: number) => {
    if (code !== 0) {
      logger.logError(`[NapCat] [UtilityProcess] Worker进程退出，退出码: ${code}`);
    } else {
      logger.log('[NapCat] [UtilityProcess] Worker进程正常退出');
    }

    // 可选：自动重启工作进程
    // logger.log('[NapCat] [UtilityProcess] 正在重启Worker进程...');
    // setTimeout(() => restartWorker(), 1000);
  });

  // 监听子进程生成
  child.on('spawn', () => {
    logger.log('[NapCat] [UtilityProcess] Worker进程已生成');
  });
}

async function startMasterProcess () {
  logger.log('[NapCat] [UtilityProcess] Master进程启动，PID:', process.pid);

  // 连接命名管道，用于输出子进程内容
  await connectToNamedPipe(logger).catch(e => logger.logError('命名管道连接失败', e));

  // 启动 worker 进程
  await startWorker();

  // 优雅关闭处理
  const shutdown = (signal: string) => {
    logger.log(`[NapCat] [UtilityProcess] 收到${signal}信号，正在关闭...`);
    if (currentWorker) {
      currentWorker.postMessage({ type: 'shutdown' });
      setTimeout(() => {
        currentWorker.kill();
        process.exit(0);
      }, 1000);
    } else {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

async function startWorkerProcess () {
  logger.log('[NapCat] [UtilityProcess] Worker进程启动，PID:', process.pid);

  // 监听来自父进程的消息
  process.parentPort?.on('message', (e: { data: any; }) => {
    const msg = e.data;
    if (msg?.type === 'shutdown') {
      logger.log('[NapCat] [UtilityProcess] 收到关闭信号，正在退出...');
      process.exit(0);
    }
  });

  // 注册重启进程函数到 WebUI（在 Worker 进程中）
  const { WebUiDataRuntime } = await import('@/napcat-webui-backend/src/helper/Data');
  WebUiDataRuntime.setRestartProcessCall(async () => {
    try {
      // 向父进程发送重启请求
      if (process.parentPort) {
        process.parentPort.postMessage({ type: 'restart' });
        return { result: true, message: '进程重启请求已发送' };
      } else {
        return { result: false, message: '无法与主进程通信' };
      }
    } catch (e) {
      logger.logError('[NapCat] [UtilityProcess] 发送重启请求失败:', e);
      return { result: false, message: '发送重启请求失败: ' + (e as Error).message };
    }
  });

  // 在子进程中启动NapCat核心
  await NCoreInitShell();
}

// 主入口
if (isWorkerProcess) {
  // Worker进程
  startWorkerProcess().catch((e: Error) => {
    logger.logError('[NapCat] [UtilityProcess] Worker进程启动失败:', e);
    process.exit(1);
  });
} else {
  // Master进程
  startMasterProcess().catch((e: Error) => {
    logger.logError('[NapCat] [UtilityProcess] Master进程启动失败:', e);
    process.exit(1);
  });
}
