import { Chip } from '@heroui/chip'

import { getNoticeTypeName } from '@/utils/onebot'

import {
  OB11Notice,
  OB11NoticeType,
  OneBot11FriendAdd,
  OneBot11FriendRecall,
  OneBot11GroupAdmin,
  OneBot11GroupBan,
  OneBot11GroupCard,
  OneBot11GroupDecrease,
  OneBot11GroupEssence,
  OneBot11GroupIncrease,
  OneBot11GroupMessageReaction,
  OneBot11GroupRecall,
  OneBot11GroupUpload,
  OneBot11Honor,
  OneBot11LuckyKing,
  OneBot11Poke
} from '@/types/onebot'

export interface OneBotNoticeProps {
  data: OB11Notice
}

export interface NoticeProps<T> {
  data: T
}

const GroupUploadNotice: React.FC<NoticeProps<OneBot11GroupUpload>> = ({
  data
}) => {
  const { group_id, user_id, file } = data
  return (
    <>
      <div>群号: {group_id}</div>
      <div>用户ID: {user_id}</div>
      <div>文件名: {file.name}</div>
      <div>文件大小: {file.size} 字节</div>
    </>
  )
}

const GroupAdminNotice: React.FC<NoticeProps<OneBot11GroupAdmin>> = ({
  data
}) => {
  const { group_id, user_id, sub_type } = data
  return (
    <>
      <div>群号: {group_id}</div>
      <div>用户ID: {user_id}</div>
      <div>变动类型: {sub_type === 'set' ? '设置管理员' : '取消管理员'}</div>
    </>
  )
}

const GroupDecreaseNotice: React.FC<NoticeProps<OneBot11GroupDecrease>> = ({
  data
}) => {
  const { group_id, operator_id, user_id, sub_type } = data
  return (
    <>
      <div>群号: {group_id}</div>
      <div>操作者ID: {operator_id}</div>
      <div>用户ID: {user_id}</div>
      <div>原因: {sub_type}</div>
    </>
  )
}

const GroupIncreaseNotice: React.FC<NoticeProps<OneBot11GroupIncrease>> = ({
  data
}) => {
  const { group_id, operator_id, user_id, sub_type } = data
  return (
    <>
      <div>群号: {group_id}</div>
      <div>操作者ID: {operator_id}</div>
      <div>用户ID: {user_id}</div>
      <div>增加类型: {sub_type}</div>
    </>
  )
}

const GroupBanNotice: React.FC<NoticeProps<OneBot11GroupBan>> = ({ data }) => {
  const { group_id, operator_id, user_id, sub_type, duration } = data
  return (
    <>
      <div>群号: {group_id}</div>
      <div>操作者ID: {operator_id}</div>
      <div>用户ID: {user_id}</div>
      <div>禁言类型: {sub_type}</div>
      <div>禁言时长: {duration} 秒</div>
    </>
  )
}

const FriendAddNotice: React.FC<NoticeProps<OneBot11FriendAdd>> = ({
  data
}) => {
  const { user_id } = data
  return (
    <>
      <div>用户ID: {user_id}</div>
    </>
  )
}

const GroupRecallNotice: React.FC<NoticeProps<OneBot11GroupRecall>> = ({
  data
}) => {
  const { group_id, user_id, operator_id, message_id } = data
  return (
    <>
      <div>群号: {group_id}</div>
      <div>用户ID: {user_id}</div>
      <div>操作者ID: {operator_id}</div>
      <div>消息ID: {message_id}</div>
    </>
  )
}

const FriendRecallNotice: React.FC<NoticeProps<OneBot11FriendRecall>> = ({
  data
}) => {
  const { user_id, message_id } = data
  return (
    <>
      <div>用户ID: {user_id}</div>
      <div>消息ID: {message_id}</div>
    </>
  )
}

const PokeNotice: React.FC<NoticeProps<OneBot11Poke>> = ({ data }) => {
  const { group_id, user_id, target_id } = data
  return (
    <>
      <div>群号: {group_id}</div>
      <div>用户ID: {user_id}</div>
      <div>目标ID: {target_id}</div>
    </>
  )
}

const LuckyKingNotice: React.FC<NoticeProps<OneBot11LuckyKing>> = ({
  data
}) => {
  const { group_id, user_id, target_id } = data
  return (
    <>
      <div>群号: {group_id}</div>
      <div>用户ID: {user_id}</div>
      <div>目标ID: {target_id}</div>
    </>
  )
}

const HonorNotice: React.FC<NoticeProps<OneBot11Honor>> = ({ data }) => {
  const { group_id, user_id, honor_type } = data
  return (
    <>
      <div>群号: {group_id}</div>
      <div>用户ID: {user_id}</div>
      <div>荣誉类型: {honor_type}</div>
    </>
  )
}

const GroupMessageReactionNotice: React.FC<
  NoticeProps<OneBot11GroupMessageReaction>
> = ({ data }) => {
  const { group_id, user_id, message_id, likes } = data
  return (
    <>
      <div>群号: {group_id}</div>
      <div>用户ID: {user_id}</div>
      <div>消息ID: {message_id}</div>
      <div>
        表情回应:
        {likes
          .map((like) => `表情ID: ${like.emoji_id}, 数量: ${like.count}`)
          .join(', ')}
      </div>
    </>
  )
}

const GroupEssenceNotice: React.FC<NoticeProps<OneBot11GroupEssence>> = ({
  data
}) => {
  const { group_id, message_id, sender_id, operator_id, sub_type } = data
  return (
    <>
      <div>群号: {group_id}</div>
      <div>消息ID: {message_id}</div>
      <div>发送者ID: {sender_id}</div>
      <div>操作者ID: {operator_id}</div>
      <div>操作类型: {sub_type}</div>
    </>
  )
}

const GroupCardNotice: React.FC<NoticeProps<OneBot11GroupCard>> = ({
  data
}) => {
  const { group_id, user_id, card_new, card_old } = data
  return (
    <>
      <div>群号: {group_id}</div>
      <div>用户ID: {user_id}</div>
      <div>新名片: {card_new}</div>
      <div>旧名片: {card_old}</div>
    </>
  )
}

const OneBotNotice: React.FC<OneBotNoticeProps> = ({ data }) => {
  let NoticeComponent: React.ReactNode
  switch (data.notice_type) {
    case OB11NoticeType.GroupUpload:
      NoticeComponent = <GroupUploadNotice data={data} />
      break
    case OB11NoticeType.GroupAdmin:
      NoticeComponent = <GroupAdminNotice data={data} />
      break
    case OB11NoticeType.GroupDecrease:
      NoticeComponent = <GroupDecreaseNotice data={data} />
      break
    case OB11NoticeType.GroupIncrease:
      NoticeComponent = (
        <GroupIncreaseNotice data={data as OneBot11GroupIncrease} />
      )
      break
    case OB11NoticeType.GroupBan:
      NoticeComponent = <GroupBanNotice data={data} />
      break
    case OB11NoticeType.FriendAdd:
      NoticeComponent = <FriendAddNotice data={data as OneBot11FriendAdd} />
      break
    case OB11NoticeType.GroupRecall:
      NoticeComponent = <GroupRecallNotice data={data as OneBot11GroupRecall} />
      break
    case OB11NoticeType.FriendRecall:
      NoticeComponent = (
        <FriendRecallNotice data={data as OneBot11FriendRecall} />
      )
      break
    case OB11NoticeType.Notify:
      switch (data.sub_type) {
        case 'poke':
          NoticeComponent = <PokeNotice data={data as OneBot11Poke} />
          break
        case 'lucky_king':
          NoticeComponent = <LuckyKingNotice data={data as OneBot11LuckyKing} />
          break
        case 'honor':
          NoticeComponent = <HonorNotice data={data as OneBot11Honor} />
          break
      }
      break
    case OB11NoticeType.GroupMsgEmojiLike:
      NoticeComponent = (
        <GroupMessageReactionNotice
          data={data as OneBot11GroupMessageReaction}
        />
      )
      break
    case OB11NoticeType.GroupEssence:
      NoticeComponent = (
        <GroupEssenceNotice data={data as OneBot11GroupEssence} />
      )
      break
    case OB11NoticeType.GroupCard:
      NoticeComponent = <GroupCardNotice data={data as OneBot11GroupCard} />
      break
  }

  return (
    <div className="flex gap-2 items-center">
      <Chip color="warning" variant="flat">
        通知
      </Chip>
      <Chip>{getNoticeTypeName(data.notice_type)}</Chip>
      {NoticeComponent}
    </div>
  )
}

export default OneBotNotice
