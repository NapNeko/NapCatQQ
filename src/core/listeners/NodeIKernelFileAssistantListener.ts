export interface IKernelFileAssistantListener {
  onFileStatusChanged(...args: unknown[]): unknown;

  onSessionListChanged(...args: unknown[]): unknown;

  onSessionChanged(...args: unknown[]): unknown;

  onFileListChanged(...args: unknown[]): unknown;

  onFileSearch(...args: unknown[]): unknown;
}
export interface NodeIKernelFileAssistantListener extends IKernelFileAssistantListener {
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  new(adapter: IKernelFileAssistantListener): NodeIKernelFileAssistantListener;
}

export class KernelFileAssistantListener implements IKernelFileAssistantListener {
    onFileStatusChanged(...args: unknown[]) { }

    onSessionListChanged(...args: unknown[]) { }

    onSessionChanged(...args: unknown[]) { }

    onFileListChanged(...args: unknown[]) { }

    onFileSearch(...args: unknown[]) { }
}
