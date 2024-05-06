import { sleep } from '@/common/utils/helper';

type AsyncQueueTask = (() => void) | (()=>Promise<void>);


export class AsyncQueue {
  private tasks: (AsyncQueueTask)[] = [];

  public addTask(task: AsyncQueueTask) {
    this.tasks.push(task);
    // console.log('addTask', this.tasks.length);
    if (this.tasks.length === 1) {
      this.runQueue().then().catch(()=>{});
    }
  }

  private async runQueue() {
    // console.log('runQueue', this.tasks.length);
    while (this.tasks.length > 0) {
      const task = this.tasks[0];
      // console.log('typeof task', typeof task);
      try {
        const taskRet = task();
        // console.log('type of taskRet', typeof taskRet, taskRet);
        if (taskRet instanceof Promise) {
          await taskRet;
        }
      } catch (e) {
        console.error(e);
      }
      this.tasks.shift();
      await sleep(100);
    }
  }
}
