export interface NodeIKernelTianShuService {
    addKernelTianShuListener(listener:unknown): number;

    removeKernelTianShuListener(listenerId:number): void;

    reportTianShuNumeralRed(...args: unknown[]): unknown;// needs 1 arguments

}
