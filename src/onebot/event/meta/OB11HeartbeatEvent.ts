import { OB11BaseMetaEvent } from './OB11BaseMetaEvent';
import { NapCatCore } from '@/core';

interface HeartbeatStatus {
    online: boolean | undefined,
    good: boolean
}

export class OB11HeartbeatEvent extends OB11BaseMetaEvent {
    meta_event_type = 'heartbeat';
    status: HeartbeatStatus;
    interval: number;

    public constructor(core: NapCatCore, interval: number, isOnline: boolean, isGood: boolean) {
        super(core);
        this.interval = interval;
        this.status = {
            online: isOnline,
            good: isGood,
        };
    }
}
