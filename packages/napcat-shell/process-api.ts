import type { Readable } from 'stream';
import type { fork as forkType } from 'child_process';

// 扩展 Process 类型以支持 parentPort
declare global {
  namespace NodeJS {
    interface Process {
      parentPort?: {
        on (event: 'message', listener: (e: { data: unknown; }) => void): void;
        postMessage (message: unknown): void;
      };
    }
  }
}

/**
 * 统一的进程接口
 */
export interface IWorkerProcess {
  readonly pid: number | undefined;
  readonly stdout: Readable | null;
  readonly stderr: Readable | null;

  postMessage (message: unknown): void;
  kill (): boolean;
  on (event: string, listener: (...args: unknown[]) => void): void;
  once (event: string, listener: (...args: unknown[]) => void): void;
  off (event: string, listener: (...args: unknown[]) => void): void;
}

/**
 * 进程创建选项
 */
export interface ProcessOptions {
  env: NodeJS.ProcessEnv;
  stdio: 'pipe' | 'ignore' | 'inherit' | Array<'pipe' | 'ignore' | 'inherit' | 'ipc'>;
  execArgv?: string[];
}

/**
 * 进程管理器接口
 */
export interface IProcessManager {
  createWorker (modulePath: string, args: string[], options: ProcessOptions): IWorkerProcess;
  onParentMessage (handler: (message: unknown) => void): void;
  sendToParent (message: unknown): boolean;
}

/**
 * Electron utilityProcess 包装器
 */
class ElectronProcessManager implements IProcessManager {
  private utilityProcess: {
    fork (modulePath: string, args: string[], options: unknown): unknown;
  };

  constructor (utilityProcess: { fork (modulePath: string, args: string[], options: unknown): unknown; }) {
    this.utilityProcess = utilityProcess;
  }

  createWorker (modulePath: string, args: string[], options: ProcessOptions): IWorkerProcess {
    const child: any = this.utilityProcess.fork(modulePath, args, options);

    return {
      get pid () { return child.pid as number | undefined; },
      stdout: child.stdout as Readable | null,
      stderr: child.stderr as Readable | null,

      postMessage (message: unknown): void {
        child.postMessage(message);
      },

      kill (): boolean {
        return child.kill() as boolean;
      },

      on (event: string, listener: (...args: unknown[]) => void): void {
        child.on(event, listener);
      },

      once (event: string, listener: (...args: unknown[]) => void): void {
        child.once(event, listener);
      },

      off (event: string, listener: (...args: unknown[]) => void): void {
        child.off(event, listener);
      },
    };
  }

  onParentMessage (handler: (message: unknown) => void): void {
    if (process.parentPort) {
      process.parentPort.on('message', (e: { data: unknown; }) => {
        handler(e.data);
      });
    }
  }

  sendToParent (message: unknown): boolean {
    if (process.parentPort) {
      process.parentPort.postMessage(message);
      return true;
    }
    return false;
  }
}

/**
 * Node.js child_process 包装器
 */
class NodeProcessManager implements IProcessManager {
  private forkFn: typeof forkType;

  constructor (forkFn: typeof forkType) {
    this.forkFn = forkFn;
  }

  createWorker (modulePath: string, args: string[], options: ProcessOptions): IWorkerProcess {
    let execArgv = options.execArgv;
    if (execArgv === undefined && process.versions['electron']) {
      // macOS QQ 的 Electron fork 会自动设置 ELECTRON_RUN_AS_NODE 并使用 QQ Helper，
      // 即使父进程没有该变量，子进程也只接受 Node 参数。
      const runsAsNode = process.platform === 'darwin' || options.env['ELECTRON_RUN_AS_NODE'] !== undefined;
      execArgv = runsAsNode
        ? process.execArgv.filter(arg => arg !== '--no-sandbox')
        : ['--no-sandbox'];
    }
    const child = this.forkFn(modulePath, args, {
      ...options,
      ...(execArgv !== undefined ? { execArgv } : {}),
    } as any);

    return {
      get pid () { return child.pid; },
      stdout: child.stdout,
      stderr: child.stderr,

      postMessage (message: unknown): void {
        if (child.send) {
          child.send(message as any);
        }
      },

      kill (): boolean {
        return child.kill();
      },

      on (event: string, listener: (...args: unknown[]) => void): void {
        child.on(event, listener);
      },

      once (event: string, listener: (...args: unknown[]) => void): void {
        child.once(event, listener);
      },

      off (event: string, listener: (...args: unknown[]) => void): void {
        child.off(event, listener);
      },
    };
  }

  onParentMessage (handler: (message: unknown) => void): void {
    process.on('message', (message: unknown) => {
      handler(message);
    });
  }

  sendToParent (message: unknown): boolean {
    if (process.send) {
      process.send(message as any);
      return true;
    }
    return false;
  }
}

/**
 * 检测运行环境并创建对应的进程管理器
 */
export async function createProcessManager (): Promise<{
  manager: IProcessManager;
  isElectron: boolean;
}> {
  // Electron 的 Node 模式仍保留 versions.electron，但没有 utilityProcess API。
  const isElectron = process.env['NAPCAT_FORCE_NODE_PROCESS'] !== '1' &&
    process.env['ELECTRON_RUN_AS_NODE'] === undefined &&
    typeof process.versions['electron'] !== 'undefined';

  if (isElectron) {
    // @ts-ignore - electron 运行时存在但类型声明可能缺失
    const electron = await import('electron');
    if (electron.app && !electron.app.isReady()) {
      await electron.app.whenReady();
    }
    return {
      manager: new ElectronProcessManager(electron.utilityProcess),
      isElectron: true,
    };
  } else {
    const { fork } = await import('child_process');
    return {
      manager: new NodeProcessManager(fork),
      isElectron: false,
    };
  }
}
