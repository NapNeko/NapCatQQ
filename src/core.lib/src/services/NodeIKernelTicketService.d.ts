import { forceFetchClientKeyRetType } from "./common";
export interface NodeIKernelTicketService {
    addKernelTicketListener(listener: unknown): void;
    removeKernelTicketListener(listenerId: unknown): void;
    forceFetchClientKey(arg: string): Promise<forceFetchClientKeyRetType>;
    isNull(): boolean;
}
