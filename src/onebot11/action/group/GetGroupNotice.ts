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
export class GetGroupNotice extends BaseAction<PayloadType, GroupNotice[]> {
  actionName = ActionName.GoCQHTTP_GetGroupNotice;

  protected async _handle(payload: PayloadType) {
    const group = payload.group_id.toString();
    const ret = await WebApi.getGrouptNotice(group);
    if (!ret) {
      throw new Error('获取公告失败');
    }
    let retNotices: GroupNotice[] = new Array<GroupNotice>();
    for (let key in ret.feeds) {
      let retNotice: GroupNotice = {
        sender_id: ret.feeds[key].u,
        publish_time: ret.feeds[key].pubt,
        message: {
          text: ret.feeds[key].msg.text,
          image: []
        }
      }
      retNotices.push(retNotice);
    }

    return retNotices;
  }
}