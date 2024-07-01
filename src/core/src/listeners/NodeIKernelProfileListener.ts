import { User } from '@/core/entities';

interface IProfileListener {
  onProfileSimpleChanged(...args: unknown[]): void;

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
