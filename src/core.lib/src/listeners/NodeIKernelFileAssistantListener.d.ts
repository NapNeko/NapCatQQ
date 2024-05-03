export interface IKernelFileAssistantListener {
    onFileStatusChanged(...args: unknown[]): unknown;
    onSessionListChanged(...args: unknown[]): unknown;
    onSessionChanged(...args: unknown[]): unknown;
    onFileListChanged(...args: unknown[]): unknown;
    onFileSearch(...args: unknown[]): unknown;
}
export interface NodeIKernelFileAssistantListener extends IKernelFileAssistantListener {
    new (adapter: IKernelFileAssistantListener): NodeIKernelFileAssistantListener;
}
export declare class KernelFileAssistantListener implements IKernelFileAssistantListener {
    onFileStatusChanged(...args: unknown[]): void;
    onSessionListChanged(...args: unknown[]): void;
    onSessionChanged(...args: unknown[]): void;
    onFileListChanged(...args: unknown[]): void;
    onFileSearch(...args: unknown[]): void;
}
