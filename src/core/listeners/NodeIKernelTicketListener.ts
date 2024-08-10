export interface IKernelTicketListener {
}

export interface NodeIKernelTicketListener extends IKernelTicketListener {
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new(adapter: IKernelTicketListener): NodeIKernelTicketListener;
}

export class KernelTicketListener implements IKernelTicketListener {
}
