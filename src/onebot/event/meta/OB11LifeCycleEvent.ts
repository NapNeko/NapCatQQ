import { OB11BaseMetaEvent } from './OB11BaseMetaEvent';

export enum LifeCycleSubType {
    ENABLE = 'enable',
    DISABLE = 'disable',
    CONNECT = 'connect'
}

export class OB11LifeCycleEvent extends OB11BaseMetaEvent {
  meta_event_type = 'lifecycle';
  sub_type: LifeCycleSubType;

  public constructor(subType: LifeCycleSubType) {
    super();
    this.sub_type = subType;
  }
}