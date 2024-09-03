import { InstanceContext, NapCatCore } from '@/core';
import { NapCatPathWrapper } from '@/common/path';
import { LaanaFileUtils } from '@/laana-v0.1.3/utils/file';
import { LaanaMessageUtils } from '@/laana-v0.1.3/utils/message';
import { LaanaActionHandler } from '@/laana-v0.1.3/action';
import { LaanaMessageActionHandler } from '@/laana-v0.1.3/action/message';

export class NapCatLaanaAdapter {
    utils = {
        msg: new LaanaMessageUtils(this.core, this),
        file: new LaanaFileUtils(this.core, this),
    };

    actions: LaanaActionHandler;

    constructor(
        public core: NapCatCore,
        public context: InstanceContext,
        public pathWrapper: NapCatPathWrapper,
    ) {
        this.actions = {
            ...new LaanaMessageActionHandler(this.core, this).impl,
        };
    }
}
