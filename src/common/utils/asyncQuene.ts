import { randomUUID } from "crypto";

class AsyncQueue {
    private tasks: Map<string, any> = new Map<string, any>();
    private MainQuene: any = undefined;
    private callbacks: Map<string, any> = new Map<string, any>();
    private ArgList: Map<string, any> = new Map<string, any>();
    private busy = false;
    // 添加任务到队列中 返回任务ID
    public async addTask(task: any, args: any[], callBack: any) {
        let uuid = randomUUID();
        this.tasks.set(uuid, task);
        this.callbacks.set(uuid, callBack);
        this.ArgList.set(uuid, args);
        return uuid;
    }
    public async runQueue() {
        if (!this.MainQuene) {
            this.MainQuene = this.Quene();
        }
        await this.MainQuene;
        this.MainQuene = undefined;
    }
    public async Quene() {
        for (let [uuid, task] of this.tasks) {
            //console.log(uuid,...this.ArgList.get(uuid));
            let result = await task(...this.ArgList.get(uuid));
            console.log(result);
            let cb = this.callbacks.get(uuid);
            cb(result);
            this.tasks.delete(uuid);
            this.ArgList.delete(uuid);
            this.callbacks.delete(uuid);
        }
    }
}
export const ImageQuene = new AsyncQueue();