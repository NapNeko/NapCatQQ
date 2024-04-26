export interface NodeIKernelTicketService {
    addKernelTicketListener(listener: unknown): void;
    removeKernelTicketListener(listenerId: unknown): void;
    forceFetchClientKey(arg: unknown): unknown;
    isNull(): boolean;
}
