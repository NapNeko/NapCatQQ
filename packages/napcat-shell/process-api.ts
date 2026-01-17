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
}

/**
 * 进程创建选项
 */
export interface ProcessOptions {
  env: NodeJS.ProcessEnv;
  stdio: 'pipe' | 'ignore' | 'inherit' | Array<'pipe' | 'ignore' | 'inherit' | 'ipc'>;
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
      pid: child.pid as number | undefined,
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
    const child = this.forkFn(modulePath, args, options as any);

    return {
      pid: child.pid,
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
  const isElectron = typeof process.versions['electron'] !== 'undefined';

  if (isElectron) {
    // @ts-ignore - electron 运行时存在但类型声明可能缺失
    const electron = await import('electron');
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
