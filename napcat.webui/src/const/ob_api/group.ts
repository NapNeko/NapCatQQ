import { z } from 'zod'

import messageNodeSchema from './message/node'
import { baseResponseSchema, commonResponseDataSchema } from './response'

const oneBotHttpApiGroup = {
  '/set_group_kick': {
    description: '群踢人',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      user_id: z.union([z.string(), z.number()]).describe('QQ 号'),
      reject_add_request: z.boolean().describe('拒绝此人的加群请求')
    }),
    response: baseResponseSchema
  },
  '/set_group_ban': {
    description: '群禁言',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      user_id: z.union([z.string(), z.number()]).describe('QQ 号'),
      duration: z.number()
    }),
    response: baseResponseSchema
  },
  '/get_group_system_msg': {
    description: '获取群系统消息',
    request: z.object({}),
    response: baseResponseSchema.extend({
      data: z.object({
        InvitedRequest: z
          .array(
            z
              .object({
                request_id: z.string().describe('请求 ID'),
                invitor_uin: z.string().describe('邀请人 QQ 号'),
                invitor_nick: z.string().describe('邀请人昵称'),
                group_id: z.string().describe('群号'),
                message: z.string().describe('入群回答'),
                group_name: z.string().describe('群名称'),
                checked: z.boolean().describe('是否已处理'),
                actor: z.string().describe('处理人 QQ 号')
              })
              .describe('邀请入群请求')
          )
          .describe('邀请入群请求列表'),
        join_requests: z.array(
          z.object({
            request_id: z.string().describe('请求 ID'),
            requester_uin: z.string().describe('请求人 QQ 号'),
            requester_nick: z.string().describe('请求人昵称'),
            group_id: z.string().describe('群号'),
            message: z.string().describe('入群回答'),
            group_name: z.string().describe('群名称'),
            checked: z.boolean().describe('是否已处理'),
            actor: z.string().describe('处理人 QQ 号')
          })
        )
      })
    })
  },
  '/get_essence_msg_list': {
    description: '获取精华消息',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号')
    }),
    response: baseResponseSchema.extend({
      data: z
        .array(
          z
            .object({
              msg_seq: z.number().describe('消息序号'),
              msg_random: z.number().describe('消息随机数'),
              sender_id: z.number().describe('发送人 QQ 号'),
              sender_nick: z.string().describe('发送人昵称'),
              operator_id: z.number().describe('操作人 QQ 号'),
              operator_nick: z.string().describe('操作人昵称'),
              message_id: z.string().describe('消息 ID'),
              operator_time: z.string().describe('操作时间'),
              content: z.array(messageNodeSchema)
            })
            .describe('精华消息')
        )
        .describe('精华消息列表')
    })
  },
  '/set_group_whole_ban': {
    description: '全员禁言',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      enable: z.boolean().describe('是否开启')
    }),
    response: baseResponseSchema
  },
  '/set_group_portrait': {
    description: '设置群头像',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      file: z.string().describe('图片文件路径，服务器本地路径或远程 URL')
    }),
    response: baseResponseSchema.extend({
      data: commonResponseDataSchema
    })
  },
  '/set_group_admin': {
    description: '设置群管理',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      user_id: z.union([z.string(), z.number()]).describe('QQ 号'),
      enable: z.boolean().describe('是否设置为管理员')
    }),
    response: baseResponseSchema
  },
  '/set_essence_msg': {
    description: '设置群精华消息',
    request: z.object({
      message_id: z.union([z.string(), z.number()]).describe('消息 ID')
    }),
    response: baseResponseSchema.extend({
      data: z.object({
        errCode: z.number().describe('错误码'),
        errMsg: z.string().describe('错误信息'),
        result: z
          .object({
            wording: z.string().describe('?'),
            digestUin: z.string().describe('?QQ号'),
            digestTime: z.number().describe('设置时间?'),
            msg: z
              .object({
                groupCode: z.string().describe('群号'),
                msgSeq: z.number().describe('消息序号'),
                msgRandom: z.number().describe('消息随机数'),
                msgContent: z.array(messageNodeSchema).describe('消息内容'),
                textSize: z.string().describe('文本大小'),
                picSize: z.string().describe('图片大小'),
                videoSize: z.string().describe('视频大小'),
                senderUin: z.string().describe('发送人 QQ 号'),
                senderTime: z.number().describe('发送时间'),
                addDigestUin: z.string().describe('添加精华消息人 QQ 号'),
                addDigestTime: z.number().describe('添加精华消息时间'),
                startTime: z.number().describe('开始时间'),
                latestMsgSeq: z.number().describe('最新消息序号'),
                opType: z.number().describe('操作类型')
              })
              .describe('消息内容'),
            errorCode: z.number().describe('错误码')
          })
          .describe('结果')
      })
    })
  },
  '/set_group_card': {
    description: '设置群成员名片',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      user_id: z.union([z.string(), z.number()]).describe('QQ 号'),
      card: z.string().describe('名片')
    }),
    response: baseResponseSchema
  },
  '/delete_essence_msg': {
    description: '删除群精华消息',
    request: z.object({
      message_id: z.union([z.string(), z.number()]).describe('消息 ID')
    }),

    response: baseResponseSchema.extend({
      data: z.object({
        errCode: z.number().describe('错误码'),
        errMsg: z.string().describe('错误信息'),
        result: z
          .object({
            wording: z.string().describe('?'),
            digestUin: z.string().describe('?QQ号'),
            digestTime: z.number().describe('设置时间?'),
            msg: z.object({
              groupCode: z.string().describe('群号'),
              msgSeq: z.number().describe('消息序号'),
              msgRandom: z.number().describe('消息随机数'),
              msgContent: z.array(messageNodeSchema).describe('消息内容'),
              textSize: z.string().describe('文本大小'),
              picSize: z.string().describe('图片大小'),
              videoSize: z.string().describe('视频大小'),
              senderUin: z.string().describe('发送人 QQ 号'),
              senderTime: z.number().describe('发送时间'),
              addDigestUin: z.string().describe('添加精华消息人 QQ 号'),
              addDigestTime: z.number().describe('添加精华消息时间'),
              startTime: z.number().describe('开始时间'),
              latestMsgSeq: z.number().describe('最新消息序号'),
              opType: z.number().describe('操作类型')
            }),
            errorCode: z.number().describe('错误码')
          })
          .describe('结果')
      })
    })
  },
  '/set_group_name': {
    description: '设置群名称',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      group_name: z.string().describe('群名称')
    }),
    response: baseResponseSchema
  },
  '/set_group_leave': {
    description: '退出群聊',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号')
    }),
    response: baseResponseSchema
  },
  '/_send_group_notice': {
    description: '发送群公告',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      content: z.string().describe('公告内容'),
      image: z.string().optional().describe('图片地址')
    }),
    response: baseResponseSchema
  },
  '/_get_group_notice': {
    description: '获取群公告',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号')
    }),
    response: baseResponseSchema.extend({
      data: z.array(
        z.object({
          notice_id: z.string().describe('公告 ID'),
          sender_id: z.number().describe('发送人 QQ 号'),
          publish_time: z.number().describe('发布时间'),
          message: z.object({
            text: z.string().describe('文本内容'),
            image: z
              .array(
                z
                  .object({
                    id: z.string().describe('图片 ID'),
                    height: z.string().describe('高度'),
                    width: z.string().describe('宽度')
                  })
                  .describe('图片信息')
              )
              .describe('图片内容列表')
          })
        })
      )
    })
  },
  '/set_group_special_title': {
    description: '设置群成员专属头衔',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      user_id: z.union([z.string(), z.number()]).describe('QQ 号'),
      special_title: z.string().describe('专属头衔内容')
    }),
    response: baseResponseSchema
  },
  '/upload_group_file': {
    description: '上传群文件',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      file: z.string().describe('文件路径'),
      name: z.string().describe('文件名'),
      folder_id: z.string().describe('文件夹 ID')
    }),
    response: baseResponseSchema.extend({
      data: commonResponseDataSchema
    })
  },
  '/set_group_add_request': {
    description: '处理加群请求',
    request: z.object({
      flag: z.string().describe('请求ID'),
      approve: z.boolean().describe('是否同意'),
      reason: z.string().optional().describe('拒绝理由')
    }),
    response: baseResponseSchema
  },
  '/get_group_info': {
    description: '获取群信息',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号')
    }),
    response: baseResponseSchema.extend({
      data: z.object({})
    })
  },
  '/get_group_info_ex': {
    description: '获取群信息扩展',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号')
    }),
    response: baseResponseSchema.extend({
      data: z
        .object({
          groupCode: z.string().describe('群号'),
          resultCode: z.number().describe('结果码'),
          extInfo: z
            .object({
              groupInfoExtSeq: z.number().describe('群信息序列号'),
              reserve: z.number().describe('?'),
              luckyWordId: z.string().describe('幸运字符ID'),
              lightCharNum: z.number().describe('?'),
              luckyWord: z.string().describe('幸运字符'),
              starId: z.number().describe('?'),
              essentialMsgSwitch: z.number().describe('精华消息开关'),
              todoSeq: z.number().describe('?'),
              blacklistExpireTime: z.number().describe('黑名单过期时间'),
              isLimitGroupRtc: z.number().describe('是否限制群视频通话'),
              companyId: z.number().describe('公司ID'),
              hasGroupCustomPortrait: z.number().describe('是否有群自定义头像'),
              bindGuildId: z.string().describe('绑定频道ID？'),
              groupOwnerId: z
                .object({
                  memberUin: z.string().describe('群主QQ号'),
                  memberUid: z.string().describe('群主ID'),
                  memberQid: z.string().describe('群主QID')
                })
                .describe('群主信息'),
              essentialMsgPrivilege: z.number().describe('精华消息权限'),
              msgEventSeq: z.string().describe('消息事件序列号'),
              inviteRobotSwitch: z.number().describe('邀请机器人开关'),
              gangUpId: z.string().describe('?'),
              qqMusicMedalSwitch: z.number().describe('QQ音乐勋章开关'),
              showPlayTogetherSwitch: z.number().describe('显示一起玩开关'),
              groupFlagPro1: z.string()?.describe('群标识1'),
              groupBindGuildIds: z
                .object({
                  guildIds: z.array(z.string())
                })
                .describe('绑定频道ID列表?'),
              viewedMsgDisappearTime: z.string().describe('消息消失时间'),
              groupExtFlameData: z.object({
                switchState: z.number().describe('开关状态'),
                state: z.number().describe('状态'),
                dayNums: z.array(z.number()).describe('天数列表'),
                version: z.number().describe('版本号'),
                updateTime: z.string().describe('更新时间'),
                isDisplayDayNum: z.boolean().describe('是否显示天数')
              }),
              groupBindGuildSwitch: z.number().describe('绑定频道开关'),
              groupAioBindGuildId: z.string().describe('AIO绑定频道ID'),
              groupExcludeGuildIds: z
                .object({
                  guildIds: z.array(z.string()).describe('排除频道ID')
                })
                .describe('排除频道ID列表?'),
              fullGroupExpansionSwitch: z.number().describe('全员群扩容开关'),
              fullGroupExpansionSeq: z.string().describe('全员群扩容序列号'),
              inviteRobotMemberSwitch: z
                .number()
                .describe('邀请机器人成员开关'),
              inviteRobotMemberExamine: z
                .number()
                .describe('邀请机器人成员审核'),
              groupSquareSwitch: z.number().describe('群广场开关')
            })
            .describe('扩展信息')
        })
        .describe('结果')
    })
  },
  '/create_group_file_folder': {
    description: '创建群文件夹',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      folder_name: z.string().describe('文件夹名称')
    }),
    response: baseResponseSchema.extend({
      data: z
        .object({
          result: z
            .object({
              retCode: z.number().describe('结果码'),
              retMsg: z.string().describe('结果信息'),
              clientWording: z.string().describe('客户端提示')
            })
            .describe('结果'),
          groupItem: z
            .object({
              peerId: z.string().describe('?'),
              type: z.string().describe('类型'),
              folderInfo: z
                .object({
                  folderId: z.string().describe('文件夹 ID'),
                  parentFolderId: z.string().describe('父文件夹 ID'),
                  folderName: z.string().describe('文件夹名称'),
                  createTime: z.number().describe('创建时间'),
                  modifyTime: z.number().describe('修改时间'),
                  createUin: z.string().describe('创建人 QQ 号'),
                  creatorName: z.string().describe('创建人昵称'),
                  totalFileCount: z.string().describe('文件总数'),
                  modifyUin: z.string().describe('修改人 QQ 号'),
                  modifyName: z.string().describe('修改人昵称'),
                  usedSpace: z.string().describe('已使用空间')
                })
                .describe('文件夹信息')
            })
            .describe('群文件夹信息')
        })
        .describe('数据')
    })
  },
  '/delete_group_file': {
    description: '删除群文件',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      file_id: z.string().describe('文件 ID')
    }),
    response: baseResponseSchema.extend({
      data: z
        .object({
          result: z.number().describe('结果码'),
          errMsg: z.string().describe('错误信息'),
          transGroupFileResult: z
            .object({
              result: z
                .object({
                  retCode: z.number().describe('结果码'),
                  retMsg: z.string().describe('结果信息'),
                  clientWording: z.string().describe('客户端提示')
                })
                .describe('结果'),
              successFileIdList: z
                .array(z.string())
                .describe('成功文件 ID 列表'),
              failFileIdList: z.array(z.string()).describe('失败文件 ID 列表')
            })
            .describe('删除群文件结果')
        })
        .describe('结果')
    })
  },
  '/delete_group_folder': {
    description: '删除群文件夹',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      folder_id: z.string().describe('文件夹 ID')
    }),
    response: baseResponseSchema.extend({
      data: z.object({
        retCode: z.number().describe('结果码'),
        retMsg: z.string().describe('结果信息'),
        clientWording: z.string().describe('客户端提示')
      })
    })
  },
  '/get_group_file_system_info': {
    description: '获取群文件系统信息',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号')
    }),
    response: baseResponseSchema.extend({
      data: z.object({
        file_count: z.number().describe('文件总数'),
        limit_count: z.number().describe('文件总数限制'),
        used_space: z.number().describe('已使用空间'),
        total_space: z.number().describe('总空间')
      })
    })
  },
  '/get_group_root_files': {
    description: '获取群根目录文件列表',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号')
    }),
    response: baseResponseSchema.extend({
      data: z.array(
        z.object({
          files: z
            .array(
              z
                .object({
                  group_id: z.number().describe('群号'),
                  file_id: z.string().describe('文件 ID'),
                  file_name: z.string().describe('文件名'),
                  busid: z.number().describe('?'),
                  size: z.number().describe('文件大小'),
                  upload_time: z.number().describe('上传时间'),
                  dead_time: z.number().describe('过期时间'),
                  modify_time: z.number().describe('修改时间'),
                  download_times: z.number().describe('下载次数'),
                  uploader: z.number().describe('上传人 QQ 号'),
                  uploader_name: z.string().describe('上传人昵称')
                })
                .describe('文件信息')
            )
            .describe('文件列表'),
          folders: z
            .array(
              z
                .object({
                  group_id: z.number().describe('群号'),
                  folder_id: z.string().describe('文件夹 ID'),
                  folder: z.string().describe('文件夹?'),
                  folder_name: z.string().describe('文件夹名称'),
                  create_time: z.string().describe('创建时间'),
                  creator: z.string().describe('创建人 QQ 号'),
                  creator_name: z.string().describe('创建人昵称'),
                  total_file_count: z.string().describe('文件总数')
                })
                .describe('文件夹信息')
            )
            .describe('文件夹列表')
        })
      )
    })
  },
  '/get_group_files_by_folder': {
    description: '获取群子目录文件列表',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      folder_id: z.string().describe('文件夹 ID'),
      file_count: z.number().describe('文件数量')
    }),
    response: baseResponseSchema.extend({
      data: z.object({
        files: z
          .array(
            z
              .object({
                group_id: z.number().describe('群号'),
                file_id: z.string().describe('文件 ID'),
                file_name: z.string().describe('文件名'),
                busid: z.number().describe('?'),
                size: z.number().describe('文件大小'),
                upload_time: z.number().describe('上传时间'),
                dead_time: z.number().describe('过期时间'),
                modify_time: z.number().describe('修改时间'),
                download_times: z.number().describe('下载次数'),
                uploader: z.number().describe('上传人 QQ 号'),
                uploader_name: z.string().describe('上传人昵称')
              })
              .describe('文件信息')
          )
          .describe('文件列表'),
        folders: z
          .array(
            z
              .object({
                group_id: z.number().describe('群号'),
                folder_id: z.string().describe('文件夹 ID'),
                folder: z.string().describe('文件夹?'),
                folder_name: z.string().describe('文件夹名称'),
                create_time: z.string().describe('创建时间'),
                creator: z.string().describe('创建人 QQ 号'),
                creator_name: z.string().describe('创建人昵称'),
                total_file_count: z.string().describe('文件总数')
              })
              .describe('文件夹信息')
          )
          .describe('文件夹列表')
      })
    })
  },
  '/get_group_file_url': {
    description: '获取群文件下载链接',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      file_id: z.string().describe('文件 ID')
    }),
    response: baseResponseSchema.extend({
      data: z.object({
        url: z.string().describe('下载链接')
      })
    })
  },
  '/get_group_list': {
    description: '获取群列表',
    request: z.object({
      next_token: z.string().optional().describe('下一页标识')
    }),
    response: baseResponseSchema.extend({
      data: z.array(z.object({}))
    })
  },
  '/get_group_member_info': {
    description: '获取群成员信息',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      user_id: z.union([z.string(), z.number()]).describe('QQ 号'),
      no_cache: z.boolean().describe('是否不使用缓存')
    }),
    response: baseResponseSchema.extend({
      data: z.object({})
    })
  },
  '/get_group_member_list': {
    description: '获取群成员列表',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      no_cache: z.boolean().describe('是否不使用缓存')
    }),
    response: baseResponseSchema.extend({
      data: z.array(z.object({}))
    })
  },
  '/get_group_honor_info': {
    description: '获取群荣誉',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号')
    }),
    response: baseResponseSchema.extend({
      data: z
        .object({
          group_id: z.number().describe('群号'),
          current_talkative: z
            .object({
              user_id: z.number().describe('QQ 号'),
              avatar: z.string().describe('头像 URL'),
              nickname: z.string().describe('昵称'),
              day_count: z.number().describe('天数'),
              description: z.string().describe('描述')
            })
            .describe('当前龙王'),
          talkative_list: z
            .array(
              z.object({
                user_id: z.number().describe('QQ 号'),
                avatar: z.string().describe('头像 URL'),
                nickname: z.string().describe('昵称'),
                day_count: z.number().describe('天数'),
                description: z.string().describe('描述')
              })
            )
            .describe('龙王榜'),
          performer_list: z
            .array(
              z.object({
                user_id: z.number().describe('QQ 号'),
                avatar: z.string().describe('头像 URL'),
                nickname: z.string().describe('昵称'),
                description: z.string().describe('描述')
              })
            )
            .describe('?'),
          legend_list: z.array(z.string()).describe('?'),
          emotion_list: z.array(z.string()).describe('?'),
          strong_newbie_list: z.array(z.string()).describe('?')
        })
        .describe('群荣誉信息')
    })
  },
  '/get_group_at_all_remain': {
    description: '获取群 @全体成员 剩余次数',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号')
    }),
    response: baseResponseSchema.extend({
      data: z.object({
        can_at_all: z.boolean().describe('是否可以 @全体成员'),
        remain_at_all_count_for_group: z.number().describe('剩余次数(group?)'),
        remain_at_all_count_for_uin: z.number().describe('剩余次数(qq?)')
      })
    })
  },
  '/get_group_ignored_notifies': {
    description: '获取群过滤系统消息',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号')
    }),
    response: baseResponseSchema.extend({
      data: z.object({
        join_requests: z
          .array(
            z.object({
              request_id: z.string().describe('请求 ID'),
              requester_uin: z.string().describe('请求人 QQ 号'),
              requester_nick: z.string().describe('请求人昵称'),
              group_id: z.string().describe('群号'),
              group_name: z.string().describe('群名称'),
              checked: z.boolean().describe('是否已处理'),
              actor: z.string().describe('处理人 QQ 号')
            })
          )
          .describe('入群请求列表')
      })
    })
  },
  '/set_group_sign': {
    description: '设置群打卡',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号')
    }),
    response: baseResponseSchema
  },
  '/send_group_sign': {
    description: '发送群打卡',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号')
    }),
    response: baseResponseSchema
  },
  '/get_ai_characters': {
    description: '获取AI语音人物',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      chat_type: z.union([z.string(), z.number()]).describe('聊天类型')
    }),
    response: baseResponseSchema.extend({
      data: z.array(
        z.object({
          type: z.string().describe('类型'),
          characters: z.array(
            z
              .object({
                character_id: z.string().describe('人物 ID'),
                character_name: z.string().describe('人物名称'),
                preview_url: z.string().describe('预览音频地址')
              })
              .describe('人物信息')
          )
        })
      )
    })
  },
  '/send_group_ai_record': {
    description: '发送群AI语音',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      character: z.string().describe('人物ID'),
      text: z.string().describe('文本内容')
    }),
    response: baseResponseSchema.extend({
      data: z.object({
        message_id: z.string().describe('消息 ID')
      })
    })
  },
  '/get_ai_record': {
    description: '获取AI语音',
    request: z.object({
      group_id: z.string().describe('群号'),
      character: z.string().describe('人物ID'),
      text: z.string().describe('文本内容')
    }),
    response: baseResponseSchema.extend({
      data: z.string()
    })
  }
} as const

export default oneBotHttpApiGroup
