export interface IKernelTicketListener {
}
export interface NodeIKernelTicketListener extends IKernelTicketListener {
    new (adapter: IKernelTicketListener): NodeIKernelTicketListener;
}
export declare class KernelTicketListener implements IKernelTicketListener {
}
