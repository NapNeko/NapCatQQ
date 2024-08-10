import { OB11BaseMetaEvent } from './OB11BaseMetaEvent';

interface HeartbeatStatus {
    online: boolean | null,
    good: boolean
}

export class OB11HeartbeatEvent extends OB11BaseMetaEvent {
    meta_event_type = 'heartbeat';
    status: HeartbeatStatus;
    interval: number;

    public constructor(isOnline: boolean, isGood: boolean, interval: number) {
        super();
        this.interval = interval;
        this.status = {
            online: isOnline,
            good: isGood,
        };
    }
}
