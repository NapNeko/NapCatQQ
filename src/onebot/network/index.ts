import BaseAction from '@/onebot/action/BaseAction';
import { OB11BaseEvent } from '@/onebot/event/OB11BaseEvent';

export interface IOB11NetworkAdapter {
    registerAction<T extends BaseAction<P, R>, P, R>(action: T): void;
    onEvent<T extends OB11BaseEvent>(event: T): void;
}
