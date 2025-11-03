/**
 * Copyright (c) 2018, Microsoft Corporation (MIT License).
 */

interface IConptyNative {
  startProcess(file: string, cols: number, rows: number, debug: boolean, pipeName: string, conptyInheritCursor: boolean, useConptyDll: boolean): IConptyProcess;
  connect(ptyId: number, commandLine: string, cwd: string, env: string[], onExitCallback: (exitCode: number) => void): { pid: number };
  resize(ptyId: number, cols: number, rows: number, useConptyDll: boolean): void;
  clear(ptyId: number, useConptyDll: boolean): void;
  kill(ptyId: number, useConptyDll: boolean): void;
}

interface IWinptyNative {
  startProcess(file: string, commandLine: string, env: string[], cwd: string, cols: number, rows: number, debug: boolean): IWinptyProcess;
  resize(pid: number, cols: number, rows: number): void;
  kill(pid: number, innerPid: number): void;
  getProcessList(pid: number): number[];
  getExitCode(innerPid: number): number;
}

interface IUnixNative {
  fork(file: string, args: string[], parsedEnv: string[], cwd: string, cols: number, rows: number, uid: number, gid: number, useUtf8: boolean, helperPath: string, onExitCallback: (code: number, signal: number) => void): IUnixProcess;
  open(cols: number, rows: number): IUnixOpenProcess;
  process(fd: number, pty?: string): string;
  resize(fd: number, cols: number, rows: number): void;
}

interface IConptyProcess {
  pty: number;
  fd: number;
  conin: string;
  conout: string;
}

interface IWinptyProcess {
  pty: number;
  fd: number;
  conin: string;
  conout: string;
  pid: number;
  innerPid: number;
}

interface IUnixProcess {
  fd: number;
  pid: number;
  pty: string;
}

interface IUnixOpenProcess {
  master: number;
  slave: number;
  pty: string;
}
