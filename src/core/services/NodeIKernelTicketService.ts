import { ForceFetchClientKeyRetType } from './common';

export interface NodeIKernelTicketService {

    addKernelTicketListener(listener: unknown): number;

    removeKernelTicketListener(listenerId: number): void;

    forceFetchClientKey(arg: string): Promise<ForceFetchClientKeyRetType>;

    isNull(): boolean;
}
