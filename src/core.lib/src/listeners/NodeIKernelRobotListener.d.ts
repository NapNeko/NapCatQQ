export interface IKernelRobotListener {
    onRobotFriendListChanged(...args: unknown[]): void;
    onRobotListChanged(...args: unknown[]): void;
    onRobotProfileChanged(...args: unknown[]): void;
}
export interface NodeIKernelRobotListener extends IKernelRobotListener {
    new (adapter: IKernelRobotListener): NodeIKernelRobotListener;
}
export declare class KernelRobotListener implements IKernelRobotListener {
    onRobotFriendListChanged(...args: unknown[]): void;
    onRobotListChanged(...args: unknown[]): void;
    onRobotProfileChanged(...args: unknown[]): void;
}
