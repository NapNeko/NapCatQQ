export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}
export interface ILogWrapper {
  fileLogEnabled: boolean;
  consoleLogEnabled: boolean;
  cleanOldLogs (logDir: string): void;
  setFileAndConsoleLogLevel (fileLogLevel: LogLevel, consoleLogLevel: LogLevel): void;
  setLogSelfInfo (selfInfo: { nick: string; uid: string; }): void;
  setFileLogEnabled (isEnabled: boolean): void;
  setConsoleLogEnabled (isEnabled: boolean): void;
  formatMsg (msg: any[]): string;
  _log (level: LogLevel, ...args: any[]): void;
  log (...args: any[]): void;
  logDebug (...args: any[]): void;
  logError (...args: any[]): void;
  logWarn (...args: any[]): void;
  logFatal (...args: any[]): void;
  logMessage (msg: unknown, selfInfo: unknown): void;
}