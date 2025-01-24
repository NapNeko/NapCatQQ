import { z } from 'zod'

import { baseResponseSchema, commonResponseDataSchema } from './response'

const oneBotHttpApiSystem = {
  '/get_online_clients': {
    description: '获取当前账号在线客户端列表',
    request: z.object({
      no_cache: z.boolean().optional().describe('是否不使用缓存')
    }),
    response: baseResponseSchema.extend({
      data: z.object({
        clients: z.object({})
      })
    })
  },
  '/get_robot_uin_range': {
    description: '获取机器人账号范围',
    request: z.object({}),
    response: baseResponseSchema.extend({
      data: z.array(
        z.object({
          minUin: z.string(),
          maxUin: z.string()
        })
      )
    })
  },
  '/ocr_image': {
    description: 'OCR图片识别',
    request: z.object({
      image: z.string()
    }),
    response: baseResponseSchema.extend({
      data: z.array(
        z.object({
          text: z.string(),
          pt1: z.object({
            x: z.string(),
            y: z.string()
          }),
          pt2: z.object({
            x: z.string(),
            y: z.string()
          }),
          pt3: z.object({
            x: z.string(),
            y: z.string()
          }),
          pt4: z.object({
            x: z.string(),
            y: z.string()
          }),
          charBox: z.array(
            z.object({
              charText: z.string(),
              charBox: z.object({
                pt1: z.object({
                  x: z.string(),
                  y: z.string()
                }),
                pt2: z.object({
                  x: z.string(),
                  y: z.string()
                }),
                pt3: z.object({
                  x: z.string(),
                  y: z.string()
                }),
                pt4: z.object({
                  x: z.string(),
                  y: z.string()
                })
              })
            })
          ),
          score: z.string()
        })
      )
    })
  },

  '/.ocr_image': {
    description: '.OCR图片识别',
    request: z.object({
      image: z.string()
    }),
    response: baseResponseSchema.extend({
      data: z.array(
        z.object({
          text: z.string(),
          pt1: z.object({
            x: z.string(),
            y: z.string()
          }),
          pt2: z.object({
            x: z.string(),
            y: z.string()
          }),
          pt3: z.object({
            x: z.string(),
            y: z.string()
          }),
          pt4: z.object({
            x: z.string(),
            y: z.string()
          }),
          charBox: z.array(
            z.object({
              charText: z.string(),
              charBox: z.object({
                pt1: z.object({
                  x: z.string(),
                  y: z.string()
                }),
                pt2: z.object({
                  x: z.string(),
                  y: z.string()
                }),
                pt3: z.object({
                  x: z.string(),
                  y: z.string()
                }),
                pt4: z.object({
                  x: z.string(),
                  y: z.string()
                })
              })
            })
          ),
          score: z.string()
        })
      )
    })
  },
  '/translate_en2zh': {
    description: '英文翻译为中文',
    request: z.object({
      words: z.array(z.string())
    }),
    response: baseResponseSchema.extend({
      data: z.array(z.string())
    })
  },
  '/get_login_info': {
    description: '获取登录号信息',
    request: z.object({}),
    response: baseResponseSchema.extend({
      data: z.object({
        user_id: z.number(),
        nickname: z.string()
      })
    })
  },
  '/set_input_status': {
    description: '设置输入状态',
    request: z.object({
      eventType: z.union([z.literal(0), z.literal(1)]),
      user_id: z.union([z.number(), z.string()])
    }),
    response: baseResponseSchema.extend({
      data: commonResponseDataSchema
    })
  },
  '/download_file': {
    description: '下载文件到缓存目录',
    request: z
      .object({
        base64: z.string().optional(),
        url: z.string().optional(),
        thread_count: z.number(),
        headers: z.union([z.string(), z.array(z.string())]),
        name: z.string().optional()
      })
      .refine(
        (data) => (data.base64 && !data.url) || (!data.base64 && data.url),
        {
          message: 'base64 和 url 必须二选一，且不能同时存在或同时为空',
          path: ['base64', 'url']
        }
      ),
    response: baseResponseSchema.extend({
      data: z.object({
        file: z.string()
      })
    })
  },
  '/get_cookies': {
    description: '获取cookies',
    request: z.object({
      domain: z.string()
    }),
    response: baseResponseSchema.extend({
      data: z.object({
        cookies: z.string(),
        bkn: z.string()
      })
    })
  },
  '/.handle_quick_operation': {
    description: '.对事件执行快速操作',
    request: z.object({
      context: z.object({}),
      operation: z.object({})
    }),
    response: baseResponseSchema
  },
  '/get_csrf_token': {
    description: '获取CSRF Token',
    request: z.object({}),
    response: baseResponseSchema.extend({
      data: z.object({
        token: z.number()
      })
    })
  },
  '/_del_group_notice': {
    description: '_删除群公告',
    request: z.object({
      group_id: z.union([z.number(), z.string()]),
      notice_id: z.number()
    }),
    response: baseResponseSchema
  },
  '/get_credentials': {
    description: '获取 QQ 相关接口凭证',
    request: z.object({
      domain: z.string()
    }),
    response: baseResponseSchema.extend({
      data: z.object({
        cookies: z.string(),
        token: z.number()
      })
    })
  },
  '/_get_model_show': {
    description: '_获取在线机型',
    request: z.object({
      model: z.string()
    }),
    response: baseResponseSchema.extend({
      data: z.array(
        z.object({
          variants: z.object({
            model_show: z.string(),
            need_pay: z.boolean()
          })
        })
      )
    })
  },
  '/_set_model_show': {
    description: '_设置在线机型',
    request: z.object({
      model: z.string(),
      model_show: z.string()
    }),
    response: baseResponseSchema
  },
  '/can_send_image': {
    description: '检查是否可以发送图片',
    request: z.object({}),
    response: baseResponseSchema.extend({
      yes: z.boolean()
    })
  },
  '/nc_get_packet_status': {
    description: '获取packet状态',
    request: z.object({}),
    response: baseResponseSchema
  },
  '/can_send_record': {
    description: '检查是否可以发送语音',
    request: z.object({}),
    response: baseResponseSchema.extend({
      yes: z.boolean()
    })
  },
  '/get_status': {
    description: '获取状态',
    request: z.object({}),
    response: baseResponseSchema.extend({
      data: z.object({
        online: z.boolean(),
        good: z.boolean(),
        stat: z.object({})
      })
    })
  },
  '/nc_get_rkey': {
    description: '获取rkey',
    request: z.object({}),
    response: baseResponseSchema.extend({
      data: z.array(
        z.object({
          rkey: z.string(),
          ttl: z.string(),
          time: z.number(),
          type: z.number()
        })
      )
    })
  },
  '/get_version_info': {
    description: '获取版本信息',
    request: z.object({}),
    response: baseResponseSchema.extend({
      data: z.object({
        app_name: z.string(),
        protocol_version: z.string(),
        app_version: z.string()
      })
    })
  },
  '/get_group_shut_list': {
    description: '获取群禁言列表',
    request: z.object({
      group_id: z.union([z.number(), z.string()])
    }),
    response: baseResponseSchema.extend({
      data: z.object({
        uid: z.string(),
        qid: z.string(),
        uin: z.string(),
        nick: z.string(),
        remark: z.string(),
        cardType: z.number(),
        cardName: z.string(),
        role: z.number(),
        avatarPath: z.string(),
        shutUpTime: z.number(),
        isDelete: z.boolean(),
        isSpecialConcerned: z.boolean(),
        isSpecialShield: z.boolean(),
        isRobot: z.boolean(),
        groupHonor: z.record(z.number()),
        memberRealLevel: z.number(),
        memberLevel: z.number(),
        globalGroupLevel: z.number(),
        globalGroupPoint: z.number(),
        memberTitleId: z.number(),
        memberSpecialTitle: z.string(),
        specialTitleExpireTime: z.string(),
        userShowFlag: z.number(),
        userShowFlagNew: z.number(),
        richFlag: z.number(),
        mssVipType: z.number(),
        bigClubLevel: z.number(),
        bigClubFlag: z.number(),
        autoRemark: z.string(),
        creditLevel: z.number(),
        joinTime: z.number(),
        lastSpeakTime: z.number(),
        memberFlag: z.number(),
        memberFlagExt: z.number(),
        memberMobileFlag: z.number(),
        memberFlagExt2: z.number(),
        isSpecialShielded: z.boolean(),
        cardNameId: z.number()
      })
    })
  }
} as const

export default oneBotHttpApiSystem
