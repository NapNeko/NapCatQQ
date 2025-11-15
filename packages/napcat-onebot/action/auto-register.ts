import { OneBotAction } from './OneBotAction';
export const AutoRegisterRouter: Array<new (...args: any[]) => OneBotAction<unknown, unknown>> = [];

export function ActionHandler (target: new (...args: any[]) => OneBotAction<unknown, unknown>) {
  AutoRegisterRouter.push(target);
}
