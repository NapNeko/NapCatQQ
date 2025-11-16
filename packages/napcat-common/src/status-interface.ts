export interface SystemStatus {
  cpu: {
    model: string,
    speed: string;
    usage: {
      system: string;
      qq: string;
    },
    core: number;
  },
  memory: {
    total: string;
    usage: {
      system: string;
      qq: string;
    };
  },
  arch: string;
}
export interface IStatusHelperSubscription {
  on (event: 'statusUpdate', listener: (status: SystemStatus) => void): this;
  off (event: 'statusUpdate', listener: (status: SystemStatus) => void): this;
  emit (event: 'statusUpdate', status: SystemStatus): boolean;
}