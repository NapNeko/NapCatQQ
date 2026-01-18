import { NCoreInitShell } from './base';
import { NapCatPathWrapper } from '@/napcat-common/src/path';
import { LogWrapper } from '@/napcat-core/helper/log';
import { connectToNamedPipe } from './pipe';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { AuthHelper } from '@/napcat-webui-backend/src/helper/SignToken';
import { webUiRuntimePort } from '@/napcat-webui-backend/index';
import { createProcessManager, type IProcessManager, type IWorkerProcess } from './process-api';
import path from 'path';
import { fileURLToPath } from 'url';

// ES 模块中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 环境变量配置
const ENV = {
  isWorkerProcess: process.env['NAPCAT_WORKER_PROCESS'] === '1',
  isMultiProcessDisabled: process.env['NAPCAT_DISABLE_MULTI_PROCESS'] === '1',
  isPipeDisabled: process.env['NAPCAT_DISABLE_PIPE'] === '1',
} as const;

// Worker 消息类型
interface WorkerMessage {
  type: 'restart' | 'restart-prepare' | 'shutdown';
  secretKey?: string;
  port?: number;
}

// 初始化日志
const pathWrapper = new NapCatPathWrapper();
const logger = new LogWrapper(pathWrapper.logsPath);

// 进程管理器和当前 Worker 进程引用
let processManager: IProcessManager | null = null;
let currentWorker: IWorkerProcess | null = null;
let isElectron = false;
let isRestarting = false;
let isShuttingDown = false;

/**
 * 获取进程类型名称（用于日志）
 */
function getProcessTypeName (): string {
  return isElectron ? 'UtilityProcess' : 'Fork';
}

/**
 * 获取 Worker 脚本路径
 */
function getWorkerScriptPath (): string {
  return __filename.endsWith('.mjs')
    ? path.join(__dirname, 'napcat.mjs')
    : path.join(__dirname, 'napcat.js');
}

/**
 * 检查进程是否存在
 */
function isProcessAlive (pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * 强制终止进程
 */
function forceKillProcess (pid: number): void {
  try {
    process.kill(pid, 'SIGKILL');
  } catch (error) {
    // SIGKILL 失败，在 Windows 上使用 taskkill 兜底
    if (process.platform === 'win32') {
      try {
        require('child_process').execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
      } catch {
        logger.logError(`[NapCat] [Process] 强制终止进程失败: PID ${pid}`);
      }
    } else {
      logger.logError(`[NapCat] [Process] 强制终止进程失败:`, error);
    }
  }
}

/**
 * 重启 Worker 进程
 */
export async function restartWorker (secretKey?: string, port?: number): Promise<void> {
  isRestarting = true;

  if (!currentWorker) {
    logger.logWarn('[NapCat] [Process] 没有运行中的Worker进程');
    await startWorker(false);
    isRestarting = false;
    return;
  }

  const workerPid = currentWorker.pid;

  // 1. 通知旧进程准备重启（旧进程会自行退出）
  currentWorker.postMessage({ type: 'restart-prepare' });

  // 2. 等待进程退出（最多 5 秒，给更多时间让进程自行清理）
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      logger.logWarn('[NapCat] [Process] Worker进程未在 5 秒内退出，尝试发送强制关闭信号');
      currentWorker?.postMessage({ type: 'shutdown' });

      // 再等待 2 秒
      setTimeout(() => {
        logger.logWarn('[NapCat] [Process] Worker进程仍未退出，尝试 kill');
        currentWorker?.kill();
        resolve();
      }, 2000);
    }, 5000);

    currentWorker?.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
  });

  // 3. 二次确认进程是否真的被终止（兜底检查）
  if (workerPid && isProcessAlive(workerPid)) {
    logger.logWarn(`[NapCat] [Process] 进程 ${workerPid} 仍在运行，尝试强制杀掉`);
    forceKillProcess(workerPid);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (isProcessAlive(workerPid)) {
      logger.logError(`[NapCat] [Process] 进程 ${workerPid} 无法终止，可能需要手动处理`);
    }
  }

  // 4. 等待后启动新进程
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 5. 启动新进程（重启模式不传递快速登录参数，传递密钥和端口）
  await startWorker(false, secretKey, port);
  isRestarting = false;
}

/**
 * 启动 Worker 进程
 * @param passQuickLogin 是否传递快速登录参数，默认为 true，重启时为 false
 * @param secretKey WebUI JWT 密钥
 * @param preferredPort 优先使用的 WebUI 端口
 */
async function startWorker (passQuickLogin: boolean = true, secretKey?: string, preferredPort?: number): Promise<void> {
  if (!processManager) {
    throw new Error('进程管理器未初始化');
  }

  const workerScript = getWorkerScriptPath();
  const processType = getProcessTypeName();

  // 只在首次启动时传递 -q 或 --qq 参数给 worker 进程
  const workerArgs: string[] = [];
  if (passQuickLogin) {
    const args = process.argv.slice(2);
    const qIndex = args.findIndex(arg => arg === '-q' || arg === '--qq');
    if (qIndex !== -1 && qIndex + 1 < args.length) {
      const qFlag = args[qIndex];
      const qValue = args[qIndex + 1];
      if (qFlag && qValue) {
        workerArgs.push(qFlag, qValue);
      }
    }
  }

  const child = processManager.createWorker(workerScript, workerArgs, {
    env: {
      ...process.env,
      NAPCAT_WORKER_PROCESS: '1',
      ...(secretKey ? { NAPCAT_WEBUI_JWT_SECRET_KEY: secretKey } : {}),
      ...(preferredPort ? { NAPCAT_WEBUI_PREFERRED_PORT: String(preferredPort) } : {}),
    },
    stdio: isElectron ? 'pipe' : ['inherit', 'pipe', 'pipe', 'ipc'],
  });

  currentWorker = child;

  // 监听标准输出（直接转发）
  if (child.stdout) {
    child.stdout.on('data', (data: Buffer) => {
      process.stdout.write(data);
    });
  }

  // 监听标准错误（直接转发）
  if (child.stderr) {
    child.stderr.on('data', (data: Buffer) => {
      process.stderr.write(data);
    });
  }

  // 监听子进程消息
  child.on('message', (msg: unknown) => {
    // 处理重启请求
    if (typeof msg === 'object' && msg !== null && 'type' in msg) {
      const message = msg as WorkerMessage;
      if (message.type === 'restart') {
        restartWorker(message.secretKey, message.port).catch(e => {
          logger.logError(`[NapCat] [${processType}] 重启Worker进程失败:`, e);
        });
      }
    }
  });

  // 监听子进程退出
  child.on('exit', (code: unknown) => {
    const exitCode = typeof code === 'number' ? code : 0;
    if (exitCode !== 0) {
      logger.logError(`[NapCat] [${processType}] Worker进程退出，退出码: ${exitCode}`);
    }
    // 如果不是由于主动重启或关闭引起的退出，尝试自动重新拉起
    if (!isRestarting && !isShuttingDown) {
      logger.logWarn(`[NapCat] [${processType}] Worker进程意外退出，正在尝试重新拉起...`);
      startWorker(true).catch(e => {
        logger.logError(`[NapCat] [${processType}] 重新拉起Worker进程失败:`, e);
      });
    }
  });

  // 等待进程成功 spawn
  await new Promise<void>((resolve, reject) => {
    const onSpawn = () => {
      child.off('error', onError);
      resolve();
    };
    const onError = (...args: unknown[]) => {
      const err = args[0] as Error;
      logger.logError(`[NapCat] [${processType}] Worker进程启动失败:`, err);
      child.off('spawn', onSpawn);
      reject(err);
    };
    child.once('spawn', onSpawn);
    child.once('error', onError);
  });
}

/**
 * 启动 Master 进程
 */
async function startMasterProcess (): Promise<void> {
  // 连接命名管道（可通过环境变量禁用）
  if (!ENV.isPipeDisabled) {
    await connectToNamedPipe(logger).catch(e =>
      logger.logError('命名管道连接失败', e)
    );
  }

  // 启动 Worker 进程
  await startWorker();

  // 优雅关闭处理
  const shutdown = () => {
    isShuttingDown = true;
    if (currentWorker) {
      currentWorker.postMessage({ type: 'shutdown' });
      setTimeout(() => {
        currentWorker?.kill();
        process.exit(0);
      }, 1000);
    } else {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => shutdown());
  process.on('SIGTERM', () => shutdown());
}

/**
 * 启动 Worker 进程（子进程入口）
 */
async function startWorkerProcess (): Promise<void> {
  if (!processManager) {
    throw new Error('进程管理器未初始化');
  }

  // 监听来自父进程的消息
  processManager.onParentMessage((msg: unknown) => {
    if (typeof msg === 'object' && msg !== null && 'type' in msg) {
      if (msg.type === 'restart-prepare' || msg.type === 'shutdown') {
        setTimeout(() => {
          process.exit(0);
        }, 100);
      }
    }
  });

  // 注册重启进程函数到 WebUI
  WebUiDataRuntime.setRestartProcessCall(async () => {
    try {
      const success = processManager!.sendToParent({
        type: 'restart',
        secretKey: AuthHelper.getSecretKey(),
        port: webUiRuntimePort,
      });

      if (success) {
        return { result: true, message: '进程重启请求已发送' };
      } else {
        return { result: false, message: '无法与主进程通信' };
      }
    } catch (e) {
      logger.logError('[NapCat] [Process] 发送重启请求失败:', e);
      return {
        result: false,
        message: '发送重启请求失败: ' + (e as Error).message
      };
    }
  });

  // 启动 NapCat 核心
  await NCoreInitShell();
}

/**
 * 主入口
 */
async function main (): Promise<void> {
  // 单进程模式：直接启动核心
  if (ENV.isMultiProcessDisabled) {
    await NCoreInitShell();
    return;
  }

  // 多进程模式：初始化进程管理器
  const result = await createProcessManager();
  processManager = result.manager;
  isElectron = result.isElectron;

  // 根据进程类型启动
  if (ENV.isWorkerProcess) {
    await startWorkerProcess();
  } else {
    await startMasterProcess();
  }
}

// 启动应用
main().catch((e: Error) => {
  logger.logError('[NapCat] [Process] 启动失败:', e);
  process.exit(1);
});
