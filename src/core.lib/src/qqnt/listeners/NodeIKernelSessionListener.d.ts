export interface ISessionListener {
    onNTSessionCreate(args: unknown): void;
    onGProSessionCreate(args: unknown): void;
    onSessionInitComplete(args: unknown): void;
    onOpentelemetryInit(args: unknown): void;
    onUserOnlineResult(args: unknown): void;
    onGetSelfTinyId(args: unknown): void;
}
export interface NodeIKernelSessionListener extends ISessionListener {
    new (adapter: ISessionListener): NodeIKernelSessionListener;
}
export declare class SessionListener implements ISessionListener {
    onNTSessionCreate(args: unknown): void;
    onGProSessionCreate(args: unknown): void;
    onSessionInitComplete(args: unknown): void;
    onOpentelemetryInit(args: unknown): void;
    onUserOnlineResult(args: unknown): void;
    onGetSelfTinyId(args: unknown): void;
}
