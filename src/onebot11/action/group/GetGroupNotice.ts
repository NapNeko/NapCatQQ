import { WebApi, WebApiGroupNoticeFeed, WebApiGroupNoticeRet } from '@/core/apis/webapi';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';

interface PayloadType {
  group_id: number
}
interface GroupNotice {
  sender_id: number
  publish_time: number
  message: {
    text: string
    image: Array<{
      height: string
      width: string
      id: string
    }>
  }
}
type ApiGroupNotice = GroupNotice & WebApiGroupNoticeFeed;
export class GetGroupNotice extends BaseAction<PayloadType, GroupNotice[]> {
  actionName = ActionName.GoCQHTTP_GetGroupNotice;

  protected async _handle(payload: PayloadType) {
    const group = payload.group_id.toString();
    const ret = await WebApi.getGrouptNotice(group);
    if (!ret) {
      throw new Error('获取公告失败');
    }
    const retNotices: GroupNotice[] = new Array<ApiGroupNotice>();
    for (const key in ret.feeds) {
      const retApiNotice: WebApiGroupNoticeFeed = ret.feeds[key];
      const retNotice: GroupNotice = {
        // ...ret.feeds[key],
        sender_id: retApiNotice.u,
        publish_time: retApiNotice.pubt,
        message: {
          text: retApiNotice.msg.text,
          image: retApiNotice.msg.pics?.map((pic) => {
            return { id: pic.id, height: pic.h, width: pic.w };
          }) || []
        }
      };
      retNotices.push(retNotice);
    }

    return retNotices;
  }
}
