import { ActionName } from '../router';
import { PacketActionsExamples } from '../example/PacketActionsExamples';
import { BaseGroupTodoAction } from './BaseGroupTodoAction';
export class SetGroupTodo extends BaseGroupTodoAction {
  override actionName = ActionName.SetGroupTodo;
  override actionSummary = '设置群待办';
  override actionDescription = '将指定消息设置为群待办';
  override payloadExample = PacketActionsExamples.SetGroupTodo.payload;
  override returnExample = PacketActionsExamples.SetGroupTodo.response;

  protected override async handleGroupTodo (groupId: number, msgSeq: string) {
    await this.core.apis.PacketApi.pkt.operation.SetGroupTodo(groupId, msgSeq);
  }
}
