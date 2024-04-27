import { OB11Message } from '@/onebot11/types';
import { log } from '@/common/utils/log';
import { getGroup } from '@/common/data';

export async function logMessage(ob11Message: OB11Message){
  let prefix = '';
  if (ob11Message.message_type === 'group') {
    const group = await getGroup(ob11Message.group_id!);
    prefix = `群[${group?.groupName}(${ob11Message.group_id})] `;
  }
  const msgString = `${prefix}${ob11Message.sender.nickname}(${ob11Message.sender.user_id}): ${ob11Message.raw_message}`;
  log(msgString);
}
