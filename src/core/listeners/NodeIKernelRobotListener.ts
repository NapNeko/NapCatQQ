export interface IKernelRobotListener {
    onRobotFriendListChanged(...args: unknown[]): void;

    onRobotListChanged(...args: unknown[]): void;

    onRobotProfileChanged(...args: unknown[]): void;
}

export interface NodeIKernelRobotListener extends IKernelRobotListener {
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new(adapter: IKernelRobotListener): NodeIKernelRobotListener;
}

export class KernelRobotListener implements IKernelRobotListener {
    onRobotFriendListChanged(...args: unknown[]) {

    }

    onRobotListChanged(...args: unknown[]) {

    }

    onRobotProfileChanged(...args: unknown[]) {

    }
}
