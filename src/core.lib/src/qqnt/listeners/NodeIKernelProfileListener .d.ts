import { User } from '@/core/qqnt/entities';
interface IProfileListener {
    onProfileSimpleChanged(...args: unknown[]): void;
    onProfileDetailInfoChanged(profile: User): void;
    onStatusUpdate(...args: unknown[]): void;
    onSelfStatusChanged(...args: unknown[]): void;
    onStrangerRemarkChanged(...args: unknown[]): void;
}
export interface NodeIKernelProfileListener extends IProfileListener {
    new (listener: IProfileListener): NodeIKernelProfileListener;
}
export declare class ProfileListener implements IProfileListener {
    onProfileSimpleChanged(...args: unknown[]): void;
    onProfileDetailInfoChanged(profile: User): void;
    onStatusUpdate(...args: unknown[]): void;
    onSelfStatusChanged(...args: unknown[]): void;
    onStrangerRemarkChanged(...args: unknown[]): void;
}
export {};
