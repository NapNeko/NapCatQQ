import { sleep } from '@/common/utils/helper';

type AsyncQueueTask = (() => void) | Promise<void> ;


export class AsyncQueue {
  private tasks: (AsyncQueueTask)[] = [];

  public addTask(task: AsyncQueueTask) {
    this.tasks.push(task);
    if (this.tasks.length === 1) {
      this.runQueue().then().catch(()=>{});
    }
  }

  private async runQueue() {
    while (this.tasks.length > 0) {
      const task = this.tasks[0];
      try {
        if (task instanceof Promise) {
          await task;
        }
        else{
          task();
        }
      } catch (e) {
        console.error(e);
      }
      this.tasks.shift();
      await sleep(100);
    }
  }
}
