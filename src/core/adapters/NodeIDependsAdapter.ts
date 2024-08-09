import { log } from "@/common/utils/log";

interface IDependsAdapter {
  onMSFStatusChange(arg1: number, arg2: number): void;

  onMSFSsoError(args: unknown): void;

  getGroupCode(args: unknown): void;
}

export interface NodeIDependsAdapter extends IDependsAdapter {
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  new(adapter: IDependsAdapter): NodeIDependsAdapter;
}

export class DependsAdapter implements IDependsAdapter {
    onMSFStatusChange(arg1: number, arg2: number) {
    // console.log(arg1, arg2);
    // if (arg1 == 2 && arg2 == 2) {
    //   log("NapCat丢失网络连接,请检查网络")
    // }
    }

    onMSFSsoError(args: unknown) {
    }

    getGroupCode(args: unknown) {
    }
}
