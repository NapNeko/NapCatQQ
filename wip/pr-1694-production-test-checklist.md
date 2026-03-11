# PR #1694 生产环境测试清单

更新时间：2026-03-11  
仓库：`NapNeko/NapCatQQ`  
PR：#1694 `fix: 对齐 OneBot schema 与合并转发消息处理行为`  
当前分支：`codex/onebot-schema-audit-fixes`  
当前提交：`0ff1bf590eec90b0b0fb251b52c6c43796fb9218`

## 1. 这次改动里真正需要重点盯的风险点

这 10 个 commit 的改动虽然覆盖了很多 schema、example 和 test 文件，但从运行时行为来看，真正需要上生产验证的高风险点主要是下面几类：

### P0: 合并转发发送链路

涉及文件：

- `packages/napcat-onebot/action/msg/SendMsg.ts`
- `packages/napcat-onebot/action/go-cqhttp/SendForwardMsg.ts`
- `packages/napcat-onebot/types/message.ts`

风险原因：

- `node` 消息的 schema 被拆成了“引用已有消息的 node”和“内联 node”两种形态。
- `normalize()` 现在会递归处理 `node.data.content`，并把引用 node 的 `id` 统一转成字符串。
- `send_forward_msg` / `send_group_forward_msg` / `send_private_forward_msg` 的校验逻辑变了，现在入口字段明确是 `messages`，并且在 `check()` 阶段会把它归一化后写回 `payload.message`。
- 合并转发内部还有两条完全不同的运行路径：
  - `PacketApi.packetStatus === true` 时走 packet 模式。
  - `PacketApi.packetStatus === false` 时走旧的 `multiForwardMsg` 模式。
- reviewer 明确指出“消息接口改动必须做真实环境测试”，核心就是这里。

### P1: `set_group_leave` 的真实行为变更

涉及文件：

- `packages/napcat-onebot/action/group/SetGroupLeave.ts`
- `packages/napcat-core/apis/group.ts`

风险原因：

- 以前 `set_group_leave` 只会退群。
- 现在当 `is_dismiss=true` 时，会调用 `destroyGroup()`，也就是“群主解散群”。
- 这是带破坏性的行为变化，只能在一次性测试群验证，绝对不要在真实业务群里试。

### P1: 普通消息发送接口需要做 smoke

涉及文件：

- `packages/napcat-onebot/action/msg/SendPrivateMsg.ts`
- `packages/napcat-onebot/action/group/SendGroupMsg.ts`

风险原因：

- `send_private_msg` 和 `send_group_msg` 的参数校验更严格了。
- 对普通消息正文本身没有大改，但它们共用 `SendMsgBase`，而 `SendMsgBase` 这次被改过，最好做最小实发确认，排除普通消息被连带影响。

### P2: 几个兼容占位接口的返回值被显式固定

涉及文件：

- `packages/napcat-onebot/action/go-cqhttp/GetOnlineClient.ts`
- `packages/napcat-onebot/action/go-cqhttp/GoCQHTTPCheckUrlSafely.ts`
- `packages/napcat-onebot/action/go-cqhttp/GoCQHTTPSetModelShow.ts`
- `packages/napcat-onebot/action/guild/GetGuildList.ts`
- `packages/napcat-onebot/action/guild/GetGuildProfile.ts`

风险原因：

- 这些接口现在明确返回固定占位值，比如 `[]`、`null` 或 `{ level: 1 }`。
- 一般不会影响核心消息链路，但如果外部调用方依赖这些接口，值得做一次轻量 smoke。

## 2. 测试前准备

建议先把下面这些信息准备好并记录下来，后面 PR 回帖时能直接复用。

### 2.1 记录本次测试环境

建议记录：

- 部署时间
- 容器镜像或构建产物来源
- 当前 commit：`0ff1bf5`
- 是否使用 reviewer 提醒的方式覆盖 `napcat.mjs`
- 是否是 Docker 版
- 使用的适配器类型
- 是否能确认当前 `PacketApi.packetStatus` 为 `true` 还是 `false`

备注：

- 合并转发在 packet 模式和非 packet 模式的发送逻辑不同。
- 如果只能测一个环境，至少要把“本次生产环境实际处于哪种模式”记下来。

### 2.2 准备测试对象

建议准备：

- 一个你是群主的临时测试群
- 一个普通测试群
- 一个私聊测试对象
- 至少两条可引用的历史消息
- 至少一条“本身就是合并转发”的历史消息
- 如果要测内联 node，准备一条带图片或 CQ 段的消息内容

### 2.3 打开日志

建议至少保留以下信息：

- OneBot 请求 payload
- OneBot 返回结果
- NapCat 错误日志
- 如果合并转发失败，记录是校验失败、查不到引用消息、还是发送阶段失败

## 3. 必测用例

下面这些建议视为“上线前必须跑完”。

---

## FWD-01 群聊合并转发：引用已有消息 node

### 目的

验证“引用已有消息”的最基础路径可用。

### 风险覆盖

- `node.data.id` 统一转字符串
- `messages` 字段到 `payload.message` 的归一化
- 群聊上下文下的合并转发发送

### 前置条件

- 有一条已存在的、可被引用的群消息
- 确认该消息 id 可以被当前环境识别

### 请求示例

```json
{
  "action": "send_group_forward_msg",
  "params": {
    "group_id": "测试群号",
    "messages": [
      {
        "type": "node",
        "data": {
          "id": "已有消息ID"
        }
      }
    ]
  }
}
```

可额外补一轮把 `id` 以数字形式传入，确认归一化后仍然正常：

```json
{
  "action": "send_group_forward_msg",
  "params": {
    "group_id": "测试群号",
    "messages": [
      {
        "type": "node",
        "data": {
          "id": 123456789
        }
      }
    ]
  }
}
```

### 预期结果

- API 返回成功
- 群内成功出现合并转发卡片
- 打开卡片后能看到被引用的原始消息内容
- 不应出现“未找到消息”“生成节点为空”“发送合并转发消息失败”等错误

### 建议记录

- 成功时的请求 payload
- 返回的 `message_id`
- 群内卡片截图
- 是否处于 packet 模式

---

## FWD-02 私聊合并转发：引用已有消息 node

### 目的

验证私聊上下文下的引用 node 转发不被群聊逻辑误伤。

### 风险覆盖

- `send_private_forward_msg` 的参数校验
- `message_type=private` 的上下文选择
- 私聊 peer 构造

### 请求示例

```json
{
  "action": "send_private_forward_msg",
  "params": {
    "user_id": "测试QQ号",
    "messages": [
      {
        "type": "node",
        "data": {
          "id": "已有消息ID"
        }
      }
    ]
  }
}
```

### 预期结果

- API 返回成功
- 私聊窗口成功出现合并转发卡片
- 卡片可正常展开

### 特别关注

- 如果目标不是好友，而是临时会话，注意是否误走群上下文或临时会话上下文

---

## FWD-03 群聊合并转发：内联 node

### 目的

验证“没有 `id`，直接提供 `content` 的 node”仍能正确发送。

### 风险覆盖

- `OB11MessageNodeInlineSchema`
- `normalize(node.data.content)` 递归路径
- sender 元信息回填逻辑

### 请求示例

```json
{
  "action": "send_group_forward_msg",
  "params": {
    "group_id": "测试群号",
    "messages": [
      {
        "type": "node",
        "data": {
          "nickname": "测试发送者",
          "user_id": "123456789",
          "content": [
            {
              "type": "text",
              "data": {
                "text": "这是一条内联 node 文本"
              }
            }
          ]
        }
      }
    ]
  }
}
```

### 建议扩展

再跑一轮，`content` 中放一段图片/CQ 码，确认不是只有纯文本能用。

### 预期结果

- API 返回成功
- 合并转发卡片内显示该内联消息
- 昵称、内容渲染正常
- 不应出现空白节点

---

## FWD-04 私聊合并转发：内联 node

### 目的

补齐私聊上下文下的内联 node 路径。

### 请求示例

```json
{
  "action": "send_private_forward_msg",
  "params": {
    "user_id": "测试QQ号",
    "messages": [
      {
        "type": "node",
        "data": {
          "nickname": "测试发送者",
          "content": [
            {
              "type": "text",
              "data": {
                "text": "私聊内联 node"
              }
            }
          ]
        }
      }
    ]
  }
}
```

### 预期结果

- API 返回成功
- 私聊中能看到可展开的合并转发卡片

---

## FWD-05 嵌套合并转发：`node.content` 里再嵌套 `node`

### 目的

验证这次新增的递归归一化逻辑不会把嵌套 node 弄坏。

### 风险覆盖

- `normalizeMessageSegments()` 递归处理
- 嵌套 node 的 `id` 字符串化
- 深层合并转发生成

### 请求示例

```json
{
  "action": "send_group_forward_msg",
  "params": {
    "group_id": "测试群号",
    "messages": [
      {
        "type": "node",
        "data": {
          "nickname": "外层节点",
          "content": [
            {
              "type": "node",
              "data": {
                "nickname": "内层节点",
                "content": [
                  {
                    "type": "text",
                    "data": {
                      "text": "嵌套消息内容"
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  }
}
```

### 预期结果

- API 返回成功
- 外层卡片和内层节点都能正常展开
- 没有明显错位、空白节点、内容丢失

### 特别关注

- 如果生产环境默认开启 packet 模式，这个用例优先级非常高

---

## FWD-06 引用一条“本身就是合并转发”的历史消息

### 目的

验证引用 forward 消息时，内层 raw 数据拉取逻辑没有问题。

### 风险覆盖

- packet 模式下对 `FetchForwardMsgRaw` 的处理
- `resId` / `uuid` / 内层 action body 透传

### 请求思路

- 先准备一条现成的合并转发消息
- 再用其消息 id 作为 `node.data.id`
- 调用 `send_group_forward_msg` 或 `send_private_forward_msg`

### 预期结果

- 外层转发发送成功
- 打开的内容不是空壳
- 内层历史转发内容可见

### 失败信号

- 外层卡片存在，但内容打不开
- 卡片能打开，但内部消息为空
- 日志出现获取内层转发 raw 数据失败

---

## FWD-07 负向校验：`node` 和普通消息混发

### 目的

确认新的校验逻辑与预期一致，不会把不合法输入悄悄发出去。

### 请求示例

```json
{
  "action": "send_group_forward_msg",
  "params": {
    "group_id": "测试群号",
    "messages": [
      {
        "type": "node",
        "data": {
          "id": "123456"
        }
      },
      {
        "type": "text",
        "data": {
          "text": "hello"
        }
      }
    ]
  }
}
```

### 预期结果

- API 返回参数错误
- 明确提示“转发消息不能和普通消息混在一起发送”
- 不应实际发出任何消息

### 备注

- 这条不是业务成功路径，但很适合验证新校验是否确实生效

---

## FWD-08 负向校验：空 `id`

### 目的

确认空引用 id 现在会被 schema 拒绝。

### 请求示例

```json
{
  "action": "send_group_forward_msg",
  "params": {
    "group_id": "测试群号",
    "messages": [
      {
        "type": "node",
        "data": {
          "id": ""
        }
      }
    ]
  }
}
```

### 预期结果

- API 返回参数错误
- 不应实际发送任何消息

---

## LEAVE-01 `set_group_leave` 普通退群

### 目的

确认默认路径仍然是退群，不会误解散。

### 风险覆盖

- `is_dismiss=false` 分支

### 前置条件

- 在一个临时测试群中执行

### 请求示例

```json
{
  "action": "set_group_leave",
  "params": {
    "group_id": "测试群号",
    "is_dismiss": false
  }
}
```

### 预期结果

- 调用成功
- 机器人退出该群
- 群本身仍然存在

### 注意

- 退出后如果还要继续测群消息，记得重新拉回机器人

---

## LEAVE-02 `set_group_leave` 解散群

### 目的

确认 `is_dismiss=true` 时确实走“解散群”。

### 风险覆盖

- `destroyGroup()` 分支

### 前置条件

- 必须在一次性测试群中执行
- 必须确保当前账号就是群主

### 请求示例

```json
{
  "action": "set_group_leave",
  "params": {
    "group_id": "一次性测试群号",
    "is_dismiss": true
  }
}
```

### 预期结果

- 调用成功
- 群被解散，而不是仅机器人退出

### 绝对注意

- 这条不要在任何真实业务群、日常群、共用测试群执行

---

## 4. 建议补的 smoke 用例

下面这些不一定要写进 PR 主结论，但如果你顺手能跑，会更稳。

---

## MSG-01 普通群消息发送 smoke

### 目的

确认 `SendMsgBase` 的改动没有连带打坏普通群消息。

### 请求示例

```json
{
  "action": "send_group_msg",
  "params": {
    "group_id": "测试群号",
    "message": "普通群消息 smoke"
  }
}
```

### 预期结果

- 调用成功
- 群里收到普通文本消息

### 建议扩展

- 再发一条带图片或 reply 的普通消息

---

## MSG-02 普通私聊消息发送 smoke

### 目的

确认私聊普通消息不受影响。

### 请求示例

```json
{
  "action": "send_private_msg",
  "params": {
    "user_id": "测试QQ号",
    "message": "普通私聊消息 smoke"
  }
}
```

### 预期结果

- 调用成功
- 私聊收到文本消息

---

## COMPAT-01 占位兼容接口 smoke

### 目的

确认几个兼容占位接口依旧返回“可预期的成功占位值”。

### 建议接口

- `get_online_clients`
- `check_url_safely`
- `set_model_show`
- `get_guild_list`
- `get_guild_profile`

### 预期结果

- `get_online_clients` 返回 `[]`
- `check_url_safely` 返回 `{ "level": 1 }`
- `set_model_show` 返回 `null`
- `get_guild_list` 返回 `null`
- `get_guild_profile` 返回 `null`

### 备注

- 如果你的外部调用方根本不会碰这些接口，可以把它们放到最后

## 5. 测试结果记录模板

建议你测完后按下面这个结构整理结果，方便直接贴到 PR 评论里。

```md
已在生产/真实环境完成验证，基于提交 `0ff1bf5`。

环境说明：

- 部署方式：
- 是否 Docker：
- 当前 packet 模式：

已验证项目：

1. `send_group_forward_msg` 引用已有消息 node：通过 / 失败
2. `send_private_forward_msg` 引用已有消息 node：通过 / 失败
3. `send_group_forward_msg` 内联 node：通过 / 失败
4. 嵌套 node.content 再嵌套 node：通过 / 失败
5. 引用“本身就是合并转发”的历史消息：通过 / 失败
6. `set_group_leave` `is_dismiss=false`：通过 / 失败
7. `set_group_leave` `is_dismiss=true`（一次性测试群）：通过 / 失败
8. 普通 `send_group_msg` smoke：通过 / 失败
9. 普通 `send_private_msg` smoke：通过 / 失败

补充说明：

- 
- 
```

## 6. 我对本次生产测试的建议执行顺序

建议按这个顺序跑，效率最高，也最安全：

1. 先确认当前环境是否是 packet 模式。
2. 先跑 `MSG-01` / `MSG-02`，快速确认普通消息没炸。
3. 再跑 `FWD-01` / `FWD-02`，验证最基础的引用 node 转发。
4. 再跑 `FWD-03` / `FWD-05`，验证内联和嵌套 node。
5. 如果环境允许，再跑 `FWD-06`，确认引用历史合并转发。
6. 最后在一次性测试群跑 `LEAVE-01` / `LEAVE-02`。
7. 兼容占位接口 smoke 放到最后，有时间就补。

## 7. 最终结论建议

如果你只能给 reviewer 一个简洁结论，建议至少覆盖这三点：

1. 合并转发在真实环境下的引用 node 和内联 node 都已验证成功。
2. 普通消息发送未受影响。
3. `set_group_leave` 的 `is_dismiss=true` 只在一次性测试群验证，行为符合预期。
