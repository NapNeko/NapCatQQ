export interface ISessionListener {
  onNTSessionCreate(args: unknown): void;

  onGProSessionCreate(args: unknown): void;

  onSessionInitComplete(args: unknown): void;

  onOpentelemetryInit(args: unknown): void;

  onUserOnlineResult(args: unknown): void;

  onGetSelfTinyId(args: unknown): void;
}

export interface NodeIKernelSessionListener extends ISessionListener {
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  new(adapter: ISessionListener): NodeIKernelSessionListener;
}

export class SessionListener implements ISessionListener {
    onNTSessionCreate(args: unknown) {

    }

    onGProSessionCreate(args: unknown) {

    }

    onSessionInitComplete(args: unknown) {

    }

    onOpentelemetryInit(args: unknown) {

    }

    onUserOnlineResult(args: unknown) {

    }

    onGetSelfTinyId(args: unknown) {

    }
}
