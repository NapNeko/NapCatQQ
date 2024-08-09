import { User, UserDetailInfoListenerArg } from '@/core/entities';

interface IProfileListener {
  onProfileSimpleChanged(...args: unknown[]): void;
  onUserDetailInfoChanged(arg: UserDetailInfoListenerArg): void;
  onProfileDetailInfoChanged(profile: User): void;

  onStatusUpdate(...args: unknown[]): void;

  onSelfStatusChanged(...args: unknown[]): void;

  onStrangerRemarkChanged(...args: unknown[]): void;
}

export interface NodeIKernelProfileListener extends IProfileListener {
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  new(listener: IProfileListener): NodeIKernelProfileListener;
}

export class ProfileListener implements IProfileListener {
    onUserDetailInfoChanged(arg: UserDetailInfoListenerArg): void {
    
    }
    onProfileSimpleChanged(...args: unknown[]) {

    }

    onProfileDetailInfoChanged(profile: User) {

    }

    onStatusUpdate(...args: unknown[]) {

    }

    onSelfStatusChanged(...args: unknown[]) {

    }

    onStrangerRemarkChanged(...args: unknown[]) {

    }
}
