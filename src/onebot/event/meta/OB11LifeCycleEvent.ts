import { OB11BaseMetaEvent } from './OB11BaseMetaEvent';
import { NapCatCore } from '@/core';

export enum LifeCycleSubType {
    ENABLE = 'enable',
    DISABLE = 'disable',
    CONNECT = 'connect'
}

export class OB11LifeCycleEvent extends OB11BaseMetaEvent {
    meta_event_type = 'lifecycle';
    sub_type: LifeCycleSubType;

    public constructor(core: NapCatCore, subType: LifeCycleSubType) {
        super(core);
        this.sub_type = subType;
    }
}
