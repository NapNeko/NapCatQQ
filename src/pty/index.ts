import type { ITerminal, IPtyOpenOptions, IPtyForkOptions, IWindowsPtyForkOptions } from '@homebridge/node-pty-prebuilt-multiarch/src/interfaces';
import type { ArgvOrCommandLine } from '@homebridge/node-pty-prebuilt-multiarch/src/types';
import { WindowsTerminal } from './windowsTerminal';
import { UnixTerminal } from './unixTerminal';
import { fileURLToPath } from 'node:url';
import path, { dirname } from 'node:path';

let terminalCtor: typeof WindowsTerminal | typeof UnixTerminal;

if (process.platform === 'win32') {
    terminalCtor = WindowsTerminal;
} else {
    terminalCtor = UnixTerminal;
}

export function spawn(file?: string, args?: ArgvOrCommandLine, opt?: IPtyForkOptions | IWindowsPtyForkOptions): ITerminal {
    return new terminalCtor(file, args, opt);
}

export function open(options: IPtyOpenOptions): ITerminal {
    return terminalCtor.open(options) as ITerminal;
}
export function require_dlopen(modulename: string) {
    const module = { exports: {} };
    const import__dirname = dirname(fileURLToPath(import.meta.url));
    process.dlopen(module, path.join(import__dirname, modulename));
    return module.exports as any;
}
/**
 * Expose the native API when not Windows, note that this is not public API and
 * could be removed at any time.
 */
export const native = (process.platform !== 'win32' ? require_dlopen('./pty/' + process.platform + '.' + process.arch + '/pty.node') : null);
