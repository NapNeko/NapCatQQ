interface IKernelRecentContactListener {
    onDeletedContactsNotify(...args: unknown[]): unknown;

    onRecentContactNotification(...args: unknown[]): unknown;

    onMsgUnreadCountUpdate(...args: unknown[]): unknown;

    onGuildDisplayRecentContactListChanged(...args: unknown[]): unknown;

    onRecentContactListChanged(...args: unknown[]): unknown;

    onRecentContactListChangedVer2(...args: unknown[]): unknown;
}

export interface NodeIKernelRecentContactListener extends IKernelRecentContactListener {
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new(listener: IKernelRecentContactListener): NodeIKernelRecentContactListener;
}

export class KernelRecentContactListener implements IKernelRecentContactListener {
    onDeletedContactsNotify(...args: unknown[]) { 

    }

    onRecentContactNotification(...args: unknown[]) { 

    }

    onMsgUnreadCountUpdate(...args: unknown[]) { 

    }

    onGuildDisplayRecentContactListChanged(...args: unknown[]) {

    }

    onRecentContactListChanged(...args: unknown[]) { 

    }

    onRecentContactListChangedVer2(...args: unknown[]) { 

    }
}
