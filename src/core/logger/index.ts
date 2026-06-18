/**
 * Logger that delegates to ctx.logger (NapCat's built-in logger).
 * Falls back to console before context is initialized.
 * Fully replaces pino — no worker threads, no extra dependencies.
 */
import { tryGetCtx } from '../context/index.js';

export interface SimpleLogger {
  info(objOrMsg: unknown, msg?: string): void;
  warn(objOrMsg: unknown, msg?: string): void;
  error(objOrMsg: unknown, msg?: string): void;
  debug(objOrMsg: unknown, msg?: string): void;
  child(bindings: Record<string, unknown>): SimpleLogger;
}

function fmt(prefix: string, objOrMsg: unknown, msg?: string): string {
  if (msg) {
    const extra = typeof objOrMsg === 'object' && objOrMsg !== null
      ? ' ' + JSON.stringify(objOrMsg)
      : '';
    return `[${prefix}] ${msg}${extra}`;
  }
  return `[${prefix}] ${typeof objOrMsg === 'string' ? objOrMsg : JSON.stringify(objOrMsg)}`;
}

function makeLogger(prefix: string): SimpleLogger {
  const write = (level: 'info' | 'warn' | 'error' | 'debug', obj: unknown, msg?: string) => {
    const text = fmt(prefix, obj, msg);
    const ctx = tryGetCtx();
    if (ctx) { ctx.logger[level](text); }
    else      { console[level](text); }
  };
  return {
    info:  (o, m) => write('info',  o, m),
    warn:  (o, m) => write('warn',  o, m),
    error: (o, m) => write('error', o, m),
    debug: (o, m) => write('debug', o, m),
    child: (b) => makeLogger(b['module'] ? `${prefix}:${String(b['module'])}` : prefix),
  };
}

let _root: SimpleLogger = makeLogger('guardian');

/** No-op now — ctx.logger is used automatically once context is set. */
export function initLogger(_dataDir: string, _level: string): void { /* no-op */ }

export function getLogger(): SimpleLogger { return _root; }

export type { SimpleLogger as Logger };
