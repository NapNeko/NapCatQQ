export interface NodeIKernelTianShuService {
    addKernelTianShuListener(listener:unknown): number;

    removeKernelTianShuListener(listenerId:number): void;

    reportTianShuNumeralRed(...args: any[]): unknown;// needs 1 arguments

}
