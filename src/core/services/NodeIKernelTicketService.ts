import { ForceFetchClientKeyRetType } from './common';

export interface NodeIKernelTicketService {

    addKernelTicketListener(listener: unknown): void;

    removeKernelTicketListener(listenerId: unknown): void;

    forceFetchClientKey(arg: string): Promise<ForceFetchClientKeyRetType>;

    isNull(): boolean;
}
