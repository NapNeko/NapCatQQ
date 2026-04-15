import { ActionName } from '../router';
import { PacketActionsExamples } from '../example/PacketActionsExamples';
import { BaseGroupTodoAction } from './BaseGroupTodoAction';

export class CompleteGroupTodo extends BaseGroupTodoAction {
  override actionName = ActionName.CompleteGroupTodo;
  override actionSummary = '完成群待办';
  override actionDescription = '将指定消息对应的群待办标记为已完成';
  override payloadExample = PacketActionsExamples.CompleteGroupTodo.payload;
  override returnExample = PacketActionsExamples.CompleteGroupTodo.response;

  protected override async handleGroupTodo (groupId: number, msgSeq: string) {
    await this.core.apis.PacketApi.pkt.operation.CompleteGroupTodo(groupId, msgSeq);
  }
}
