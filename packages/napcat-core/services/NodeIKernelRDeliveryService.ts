export interface NodeIKernelRDeliveryService {
  addDataChangeListener (listener: unknown): number;

  removeDataChangeListener (listenerId: number): void;

  getRDeliveryDataByKey (arg: unknown): unknown;

  requestBatchRemoteDataByScene (arg1: unknown, arg2: unknown): unknown;

  requestSingleRemoteDataByKey (arg1: string, arg2: unknown): unknown;

  isNull (): boolean;
}
