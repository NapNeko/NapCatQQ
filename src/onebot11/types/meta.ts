import { stat } from '@/core/data';

export interface OB11Version {
  app_name: string
  app_version: string
  protocol_version: 'v11'
}

export interface OB11Status {
  online: boolean | null,
  good: boolean,
  stat: typeof stat
}
