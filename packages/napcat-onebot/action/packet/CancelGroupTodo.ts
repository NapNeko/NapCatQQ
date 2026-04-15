import { ActionName } from '../router';
import { PacketActionsExamples } from '../example/PacketActionsExamples';
import { BaseGroupTodoAction } from './BaseGroupTodoAction';

export class CancelGroupTodo extends BaseGroupTodoAction {
  override actionName = ActionName.CancelGroupTodo;
  override actionSummary = '取消群待办';
  override actionDescription = '将指定消息对应的群待办取消';
  override payloadExample = PacketActionsExamples.CancelGroupTodo.payload;
  override returnExample = PacketActionsExamples.CancelGroupTodo.response;

  protected override async handleGroupTodo (groupId: number, msgSeq: string) {
    await this.core.apis.PacketApi.pkt.operation.CancelGroupTodo(groupId, msgSeq);
  }
}
