import { InstanceContext, NapCatCore } from '@/core';
import { NapCatPathWrapper } from '@/common/path';
import { LaanaFileUtils } from '@/laana-v0.1.2/utils/file';
import { LaanaMessageUtils } from '@/laana-v0.1.2/utils/message';

export class NapCatLaanaAdapter {
    utils = {
        msg: new LaanaMessageUtils(this.core, this),
        file: new LaanaFileUtils(this.core, this),
    };

    constructor(
        public core: NapCatCore,
        public context: InstanceContext,
        public pathWrapper: NapCatPathWrapper,
    ) {

    }
}
