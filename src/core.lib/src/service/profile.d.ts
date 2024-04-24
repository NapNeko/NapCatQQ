import { NodeIKernelProfileService } from '../qqnt/services';
import { ProfileListener } from '../qqnt/listeners';

export declare class NapCatCoreServiceProfile {
    kernelService: NodeIKernelProfileService | null;
    readonly listener: ProfileListener;
    constructor();
    init(service: NodeIKernelProfileService): void;
    addProfileListener(listener: ProfileListener): void | undefined;
}
