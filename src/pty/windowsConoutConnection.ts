/**
 * Copyright (c) 2020, Microsoft Corporation (MIT License).
 */

import { Worker } from 'worker_threads';
import { Socket } from 'net';
import { IDisposable } from '@homebridge/node-pty-prebuilt-multiarch/src/types';
import { IWorkerData, ConoutWorkerMessage, getWorkerPipeName } from '@homebridge/node-pty-prebuilt-multiarch/src/shared/conout';
import { dirname, join } from 'path';
import { IEvent, EventEmitter2 } from '@homebridge/node-pty-prebuilt-multiarch/src/eventEmitter2';
import { fileURLToPath } from 'node:url';

/**
 * The amount of time to wait for additional data after the conpty shell process has exited before
 * shutting down the worker and sockets. The timer will be reset if a new data event comes in after
 * the timer has started.
 */
const FLUSH_DATA_INTERVAL = 1000;

/**
 * Connects to and manages the lifecycle of the conout socket. This socket must be drained on
 * another thread in order to avoid deadlocks where Conpty waits for the out socket to drain
 * when `ClosePseudoConsole` is called. This happens when data is being written to the terminal when
 * the pty is closed.
 *
 * See also:
 * - https://github.com/microsoft/node-pty/issues/375
 * - https://github.com/microsoft/vscode/issues/76548
 * - https://github.com/microsoft/terminal/issues/1810
 * - https://docs.microsoft.com/en-us/windows/console/closepseudoconsole
 */
export class ConoutConnection implements IDisposable {
    private _worker: Worker;
    private _drainTimeout: NodeJS.Timeout | undefined;
    private _isDisposed: boolean = false;

    private _onReady = new EventEmitter2<void>();
    public get onReady(): IEvent<void> { return this._onReady.event; }

    constructor(
    private _conoutPipeName: string
    ) {
        const workerData: IWorkerData = { conoutPipeName: _conoutPipeName };
        const scriptPath = dirname(fileURLToPath(import.meta.url));
        this._worker = new Worker(join(scriptPath, 'worker/conoutSocketWorker.mjs'), { workerData });
        this._worker.on('message', (message: ConoutWorkerMessage) => {
            switch (message) {
            case ConoutWorkerMessage.READY:
                this._onReady.fire();
                return;
            default:
                console.warn('Unexpected ConoutWorkerMessage', message);
            }
        });
    }

    dispose(): void {
        if (this._isDisposed) {
            return;
        }
        this._isDisposed = true;
        // Drain all data from the socket before closing
        this._drainDataAndClose();
    }

    connectSocket(socket: Socket): void {
        socket.connect(getWorkerPipeName(this._conoutPipeName));
    }

    private _drainDataAndClose(): void {
        if (this._drainTimeout) {
            clearTimeout(this._drainTimeout);
        }
        this._drainTimeout = setTimeout(() => this._destroySocket(), FLUSH_DATA_INTERVAL);
    }

    private async _destroySocket(): Promise<void> {
        await this._worker.terminate();
    }
}
