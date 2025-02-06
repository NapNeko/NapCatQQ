/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/**
 * Copyright (c) 2012-2015, Christopher Jeffrey (MIT License)
 * Copyright (c) 2016, Daniel Imms (MIT License).
 * Copyright (c) 2018, Microsoft Corporation (MIT License).
 */
import * as net from 'net';
import * as path from 'path';
import * as tty from 'tty';
import { Terminal, DEFAULT_COLS, DEFAULT_ROWS } from '@homebridge/node-pty-prebuilt-multiarch/src/terminal';
import { IProcessEnv, IPtyForkOptions, IPtyOpenOptions } from '@homebridge/node-pty-prebuilt-multiarch/src/interfaces';
import { ArgvOrCommandLine } from '@homebridge/node-pty-prebuilt-multiarch/src/types';
import { assign } from '@homebridge/node-pty-prebuilt-multiarch/src/utils';
import { pty_loader } from './prebuild-loader';
import { fileURLToPath } from 'url';
export const pty = pty_loader();

let helperPath: string;
helperPath = '../build/Release/spawn-helper';
const import__dirname = path.dirname(fileURLToPath(import.meta.url));
helperPath = path.resolve(import__dirname, helperPath);
helperPath = helperPath.replace('app.asar', 'app.asar.unpacked');
helperPath = helperPath.replace('node_modules.asar', 'node_modules.asar.unpacked');

const DEFAULT_FILE = 'sh';
const DEFAULT_NAME = 'xterm';
const DESTROY_SOCKET_TIMEOUT_MS = 200;

export class UnixTerminal extends Terminal {
    protected override _fd: number;
    protected override _pty: string;

    protected override _file: string;
    protected override _name: string;

    protected override _readable: boolean;
    protected override _writable: boolean;

    private _boundClose: boolean = false;
    private _emittedClose: boolean = false;
    private _master: net.Socket | undefined;
    private _slave: net.Socket | undefined;

    public get master(): net.Socket | undefined { return this._master; }
    public get slave(): net.Socket | undefined { return this._slave; }

    constructor(file?: string, args?: ArgvOrCommandLine, opt?: IPtyForkOptions) {
        super(opt);

        if (typeof args === 'string') {
            throw new Error('args as a string is not supported on unix.');
        }

        // Initialize arguments
        args = args || [];
        file = file || DEFAULT_FILE;
        opt = opt || {};
        opt.env = opt.env || process.env;

        this._cols = opt.cols || DEFAULT_COLS;
        this._rows = opt.rows || DEFAULT_ROWS;
        const uid = opt.uid ?? -1;
        const gid = opt.gid ?? -1;
        const env: IProcessEnv = assign({}, opt.env);

        if (opt.env === process.env) {
            this._sanitizeEnv(env);
        }

        const cwd = opt.cwd || process.cwd();
        env['PWD'] = cwd;
        const name = opt.name || env['TERM'] || DEFAULT_NAME;
        env['TERM'] = name;
        const parsedEnv = this._parseEnv(env);

        const encoding = (opt.encoding === undefined ? 'utf8' : opt.encoding);

        const onexit = (code: number, signal: number): void => {
            // XXX Sometimes a data event is emitted after exit. Wait til socket is
            // destroyed.
            if (!this._emittedClose) {
                if (this._boundClose) {
                    return;
                }
                this._boundClose = true;
                // From macOS High Sierra 10.13.2 sometimes the socket never gets
                // closed. A timeout is applied here to avoid the terminal never being
                // destroyed when this occurs.
                let timeout: NodeJS.Timeout | null = setTimeout(() => {
                    timeout = null;
                    // Destroying the socket now will cause the close event to fire
                    this._socket.destroy();
                }, DESTROY_SOCKET_TIMEOUT_MS);
                this.once('close', () => {
                    if (timeout !== null) {
                        clearTimeout(timeout);
                    }
                    this.emit('exit', code, signal);
                });
                return;
            }
            this.emit('exit', code, signal);
        };

        // fork
        const term = pty.fork(file, args, parsedEnv, cwd, this._cols, this._rows, uid, gid, (encoding === 'utf8'), helperPath, onexit);

        this._socket = new tty.ReadStream(term.fd);
        if (encoding !== null) {
            this._socket.setEncoding(encoding as BufferEncoding);
        }

        // setup
        this._socket.on('error', (err: any) => {
            // NOTE: fs.ReadStream gets EAGAIN twice at first:
            if (err.code) {
                if (~err.code.indexOf('EAGAIN')) {
                    return;
                }
            }

            // close
            this._close();
            // EIO on exit from fs.ReadStream:
            if (!this._emittedClose) {
                this._emittedClose = true;
                this.emit('close');
            }

            // EIO, happens when someone closes our child process: the only process in
            // the terminal.
            // node < 0.6.14: errno 5
            // node >= 0.6.14: read EIO
            if (err.code) {
                if (~err.code.indexOf('errno 5') || ~err.code.indexOf('EIO')) {
                    return;
                }
            }

            // throw anything else
            if (this.listeners('error').length < 2) {
                throw err;
            }
        });

        this._pid = term.pid;
        this._fd = term.fd;
        this._pty = term.pty;

        this._file = file;
        this._name = name;

        this._readable = true;
        this._writable = true;

        this._socket.on('close', () => {
            if (this._emittedClose) {
                return;
            }
            this._emittedClose = true;
            this._close();
            this.emit('close');
        });

        this._forwardEvents();
    }

    protected _write(data: string): void {
        this._socket.write(data);
    }

    /* Accessors */
    get fd(): number { return this._fd; }
    get ptsName(): string { return this._pty; }

    /**
 * openpty
 */

    public static open(opt: IPtyOpenOptions): UnixTerminal {
        const self: UnixTerminal = Object.create(UnixTerminal.prototype);
        opt = opt || {};

        if (arguments.length > 1) {
            opt = {
                cols: arguments[1],
                rows: arguments[2]
            };
        }

        const cols = opt.cols || DEFAULT_COLS;
        const rows = opt.rows || DEFAULT_ROWS;
        const encoding = (opt.encoding === undefined ? 'utf8' : opt.encoding);

        // open
        const term: IUnixOpenProcess = pty.open(cols, rows);

        self._master = new tty.ReadStream(term.master);
        if (encoding !== null) {
            self._master.setEncoding(encoding as BufferEncoding);
        }
        self._master.resume();

        self._slave = new tty.ReadStream(term.slave);
        if (encoding !== null) {
            self._slave.setEncoding(encoding as BufferEncoding);
        }
        self._slave.resume();

        self._socket = self._master;
        self._pid = -1;
        self._fd = term.master;
        self._pty = term.pty;

        self._file = process.argv[0] || 'node';
        self._name = process.env['TERM'] || '';

        self._readable = true;
        self._writable = true;

        self._socket.on('error', err => {
            self._close();
            if (self.listeners('error').length < 2) {
                throw err;
            }
        });

        self._socket.on('close', () => {
            self._close();
        });

        return self;
    }

    public destroy(): void {
        this._close();

        // Need to close the read stream so node stops reading a dead file
        // descriptor. Then we can safely SIGHUP the shell.
        this._socket.once('close', () => {
            this.kill('SIGHUP');
        });

        this._socket.destroy();
    }

    public kill(signal?: string): void {
        try {
            process.kill(this.pid, signal || 'SIGHUP');
        } catch { /* swallow */ }
    }

    /**
 * Gets the name of the process.
 */
    public get process(): string {
        if (process.platform === 'darwin') {
            const title = pty.process(this._fd);
            return (title !== 'kernel_task') ? title : this._file;
        }

        return pty.process(this._fd, this._pty) || this._file;
    }

    /**
 * TTY
 */

    public resize(cols: number, rows: number): void {
        if (cols <= 0 || rows <= 0 || isNaN(cols) || isNaN(rows) || cols === Infinity || rows === Infinity) {
            throw new Error('resizing must be done using positive cols and rows');
        }
        pty.resize(this._fd, cols, rows);
        this._cols = cols;
        this._rows = rows;
    }

    public clear(): void {

    }

    private _sanitizeEnv(env: IProcessEnv): void {
        // Make sure we didn't start our server from inside tmux.
        delete env['TMUX'];
        delete env['TMUX_PANE'];

        // Make sure we didn't start our server from inside screen.
        // http://web.mit.edu/gnu/doc/html/screen_20.html
        delete env['STY'];
        delete env['WINDOW'];

        // Delete some variables that might confuse our terminal.
        delete env['WINDOWID'];
        delete env['TERMCAP'];
        delete env['COLUMNS'];
        delete env['LINES'];
    }
}
