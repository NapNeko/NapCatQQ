# QQ 空间接口

接口名称和默认调用方式兼容 SnowLuma。身份凭据由当前登录的 QQ 账号内部取得。`tid` 模式使用空间 Web CGI；`feed_ref` 模式保留 QQ 内置空间 H5 的完整引用和原始数据。不会从 `tid` 伪造动态身份，也不会在写入失败后切换后端重发。

## 接口与参数

以下为 OneBot action 的参数；调用方式与其他 OneBot HTTP / WebSocket 接口相同。

| Action | 参数 | 返回 data |
| --- | --- | --- |
| `get_qzone_feeds` | `page_num?=1`，`count?=10`，`cursor?`，`format?` | `{feeds, has_more, next_cursor}` |
| `get_qzone_msg_list` | `target_uin?`，`pos?=0`，`num?=20`，`format?`；原生模式支持 `cursor?` | 默认 `{total, total_known, msglist}`；原生模式保留原有返回 |
| `get_qzone_msg_detail` | `tid, target_uin?, pos?=0, num?=20`；或完整 `feed_ref` | SL 扁平详情、评论；引用模式保留原始 Feed 和评论续页信息 |
| `get_qzone_comment_list` | `feed_ref`，`cursor?` | `{feed_ref, comment_num, comments, has_more, next_cursor, raw}` |
| `get_qzone_comment_replies` | `feed_ref`，完整 `comment`，`cursor?` | `{feed_ref, comment_id, replies, reply_num, has_more, next_cursor, raw}` |
| `send_qzone_msg` | `content`，`images?`，`ugc_right?`，`target_uins?` | `{tid, time}` |
| `delete_qzone_msg` | `tid` | `null`，沿用原有接口 |
| `like_qzone` | `tid, target_uin?, abstime?=0`；或完整 `feed_ref` | `null` |
| `unlike_qzone` | 同点赞 | `null` |
| `comment_qzone` | SL：`tid, content, target_uin?, images?, comment_id?, comment_uin?, reply_uin?, reply_name?`；原生：`feed_ref, content, comment?, reply_user?` | SL：`{comment_id, parent_comment_id?, parent_comment_uin?}`；原生保留 `{comment_id, comment}` |
| `get_qzone_profile` | `target_uin?` | `{name, description}` |
| `set_qzone_profile` | `name?`，`description?`，至少一项 | `null` |
| `set_qzone_msg_right` | `tid`，`ugc_right`，`target_uins?` | `{ugc_right}` |
| `set_qzone_ban` | `user_id`，`enable?`，默认 `true` | `null` |

`target_uin` 为说说所属的 QQ 账号，省略时使用当前账号。数值和字符串形式都可传入。空间访问权限仍由 QQ 服务端判断，接口不改变目标空间的访问权限。

列表默认 `format: "snowluma"`；`format: "native"` 保留原有 H5 列表和动态格式。未指定格式时，已有原生 `cursor` 会自动选择原生模式；SL 动态游标带 `slqf:` 前缀。不同模式的分页参数不得混用。

## SL 列表、详情与赞评

空参数读取 SL 好友动态首页，每页 `count` 为 1–50，默认 10。`page_num` 大于 1 时顺序读取前面的服务端页；单次最多 20 页，总读取预算 45 秒，深页使用 `next_cursor`。续页可以调整 `count`；若同时指定非默认 `page_num`，必须与游标页码一致。

SL 动态每项返回 `uin/nickname/time/appid/key/html`，以及可提取的 `tid/content/content_complete/images/like_count/comment_count`。`html` 保留服务端 HTML，解析时不会执行脚本或获取其中资源；正文提取排除评论、头像、视频封面。无法可靠提取的结构化内容为 `null`。

SL 说说列表使用 `pos/num`，默认 0/20，`num` 为 1–100：

```json
{ "target_uin": "10002", "pos": 0, "num": 20 }
```

返回 `total` 和 `msglist`，每项为 `tid/content/time/comment_num/is_private/images`。`total_known:true` 表示服务端提供了总数；缺少总数时，按 SL 约定回退为当前页长度，并明确返回 `total_known:false`，不能据此推断空间总量。

详情、点赞和评论可以直接使用读取或发表返回的 `tid`。详情的 `pos/num` 表示一级评论偏移和数量：

```json
{ "tid": "实际说说ID", "target_uin": "10002", "pos": 0, "num": 20 }
```

SL 详情返回 `tid/content/comment_num/comments`。每条一级评论包含 `comment_id/uin/name/time/content/replies`；内联回复另外包含 `parent_comment_id/parent_comment_uin`，用于后续回复，不能将楼中楼自身 ID 当成父评论 ID。内联回复不保证完整。

点赞和取消赞使用 `tid/target_uin/abstime`，`abstime` 是说说发表的 Unix 秒时间，省略按 SL 约定为 0。普通评论支持 `images`，上传成功后使用真实图片地址发表评论；回复评论时成对传 `comment_id/comment_uin`，指定楼中楼对象时再成对传 `reply_uin/reply_name`：

```json
{
  "tid": "实际说说ID", "target_uin": "10002", "content": "回复正文",
  "comment_id": "0", "comment_uin": "10003",
  "reply_uin": "10004", "reply_name": "被回复者昵称"
}
```

父评论字符串 ID `"0"` 有效。楼中楼不支持图片，非法组合在上传或写入前拒绝。普通评论成功但未回传新 ID 时，`comment_id` 按 SL 约定为 `""`，表示 ID 未知；回复必须返回真实的新回复 ID，不能用父 ID 代替。

正常数值字符串可用于分页和 QQ 号；数值账号必须安全且不能丢失精度。黑名单开关也接受 `true/false`、`1/0`、`yes/no`、`on/off` 等常用 SL 布尔写法。列表的 `total_known`、发表时间 0 和空评论 ID 是明确的缺失值标记，不表示已经读到真实值。

## 原生列表与续页

首次调用 `get_qzone_feeds` 传 `{ "format": "native" }`；`get_qzone_msg_list` 可传：

```json
{
  "format": "native",
  "target_uin": "10002"
}
```

读取结果中的 `has_more`，为 `true` 时将 `next_cursor` 原样作为下一次请求的 `cursor`。查询其他账号的个人说说时，续页仍须传相同的 `target_uin`。

游标绑定当前登录账号、接口类型和查询对象；评论游标还绑定动态引用，楼中楼游标还绑定父评论 ID 及作者上下文。有效期为 10 分钟，并采用有界内存缓存。过期、重启、缓存被淘汰或账号改变后，重新从第一页获取。不要解析游标或自行拼接上游字段。

列表中的每项包含：

- `tid`、`user_id`、`content`、`time`、`images`、`comment_num`、`like_num`：便于展示的规范化字段。未能可靠提取时为 `null`；时间单位为 Unix 秒。
- `feed_ref`：详情、点赞和评论所需的完整操作引用，部分非标准 Feed 可能为 `null`。
- `feed`：保留上游返回的完整 Feed 结构，包含未规范化的字段。

`content = null` 表示该 Feed 的内容形状尚不能完整转换为纯文本，不表示正文为空。`images = null` 同理表示图片字段未能可靠提取。

`seal_off_memory` 为个人说说列表返回的封存状态对象，存在时原样保留。不要根据空数组推断账号没有历史说说。

## 原生详情与赞评

从原生列表项取出 `feed_ref`，原样传给 `get_qzone_msg_detail`、`like_qzone`、`unlike_qzone` 或 `comment_qzone`。`feed_ref` 和 SL 的 `tid` 两组定位参数不能混用。

引用包含完整 `union_id`，并可能包含 `cell_feed_transfer`、域类型和点赞 key。不同字段用于不同业务对象，不能用 `tid` 补齐缺失字段，也不能假定 `uf_key/ugc_id/feed_id` 对现有帖子相等。引用缺失或无效时接口会报错。

`comment_qzone` 不传 `comment` 时发表一级评论。回复评论时，将满足原有写接口约束的完整父评论对象传入 `comment`：父评论 ID 为非空字符串，作者包含有效 `user.uin`。默认回复父评论作者；回复楼中楼的其他用户时，额外传入从原始数据取得的 `reply_user`（含 `uin`，可附带 `uid/nick`）。`reply_user` 依赖 `comment`，不能单独提供。返回的 `comment` 为新评论或新回复的完整对象。

原生评论和回复支持纯文本。正文转换为 RichMsg 文本段，不能为空或全为空白，最多 2000 个 UTF-16 代码单元（与所分析 QQ 编辑器一致）；图片一级评论使用上述 SL `tid` 模式。

## 读取完整评论区

`get_qzone_msg_detail` 在 `feed_ref` 模式下的 `comments` 保持原来的原始评论数组结构，增加可选的 `comment_has_more` 和 `comment_next_cursor`。它只包含详情首批评论；每条评论的 `replys` 也可能只包含部分楼中楼。获取详情后，可直接将详情的 `feed_ref` 和 `comment_next_cursor` 交给 `get_qzone_comment_list` 续页，不必重复读取首批。

需要统一的展示字段时，从 `get_qzone_comment_list` 开始：

```json
{
  "action": "get_qzone_comment_list",
  "params": {
    "feed_ref": {
      "union_id": { "uf_key": "读取结果的实际值", "ugc_id": "读取结果的实际值" },
      "feed_action_domain_type": 1
    }
  }
}
```

示例仅说明请求形状，实际 `feed_ref` 必须完整取自列表或详情。首批通过 QQ 的详情接口读取，后续通过评论接口读取。每次返回一页；当 `has_more` 为 `true`，继续传入本页返回的完整 `feed_ref` 和 `next_cursor`，直到 `has_more` 为 `false`。服务端可能更新动态上下文，因此续页应使用最新返回的引用。

每条 `comments` 项包含以下字段：

| 字段 | 含义 |
| --- | --- |
| `comment_id` | 规范化后的评论 ID，字符串；数值 ID `0` 有效 |
| `user_id`、`uid`、`nickname` | 评论作者 QQ 号、UID、昵称；只有 UID 的作者仍会保留 |
| `time` | Unix 秒，来自上游 `time` |
| `content` | 可可靠转换的纯文本；原始 RichMsg 在 `comment.content` |
| `images` | 可可靠识别的图片地址；完整媒体结构在 `comment.media_items` |
| `like_count`、`liked` | 上游点赞数、当前账号是否已赞 |
| `reply_num` | 上游返回的该评论回复数；不是当前已加载条数 |
| `has_more_replies` | 上游是否指示还有楼中楼，未知时为 `null` |
| `replies` | 本批评论中附带的内联楼中楼，采用下述回复结构 |
| `comment` | 完整原始评论，保留头像、富文本、媒体、点赞标识、回复指针和未知字段 |

分页外层的 `comment_num` 是服务端返回的评论数，可能为 `null`；不能根据当前页长度推算总数。`raw` 保留本次业务响应的完整对象。无法可靠转换的规范化字段返回 `null`；明确返回的空文本、零计数、`false` 或空媒体数组会按实际值保留。头像等没有稳定规范化约定的字段可从 `comment.user.portrait` 等原始数据中读取。

读取某条评论后续的楼中楼时，传入该项的完整 `comment`，不要只传规范化的 `comment_id`：

```json
{
  "action": "get_qzone_comment_replies",
  "params": {
    "feed_ref": { "union_id": { "uf_key": "读取结果的实际值" } },
    "comment": {
      "id": 0,
      "user": { "uid": "读取结果的实际作者UID" },
      "replys": [],
      "has_more_reply": true,
      "reply_attach_info": "读取结果中的实际回复指针"
    }
  }
}
```

这里的 `comment` 同样只是结构示例，实际调用应原样传回整个对象。读取接口支持字符串或安全整数 ID，保留原始类型；作者可以只有 UID，也可以缺省。发表回复仍沿用原有写接口的字符串 ID 和作者 QQ 号约束；读取成功不代表该对象一定满足写接口要求，不要为通过校验而伪造作者或改写原始 ID。

回复页 `replies` 每项包含 `reply_id`、作者信息、`time`、`content`、`images`、`like_count`、`liked`，还包含 `target_user_id`、`target_uid`、`target_nickname` 表示被回复者，以及完整原始 `reply`。作者与被回复者分别返回。外层 `reply_num` 采用父评论的服务端计数，未知时为 `null`；`raw` 保留本页原始响应。

楼中楼接口读取的是父评论内联 `replys` 之后的追加回复。调用方先保留内联 `replies`，再将后续各页按 `reply_id` 合并；跨父评论合并时使用父评论 ID 加回复 ID，ID 无法确定的项应保留原始对象，不要按 `null` 相互覆盖。后续页继续传本页的 `feed_ref`、同一完整父评论及 `next_cursor`。每页使用 QQ 客户端的固定大小 20，不提供未经确认的 `page_size/count/pos` 参数，也不自动无限拉取所有评论和回复。

“读取完整评论区”需要完成一级评论分页，再分别完成各父评论的回复分页；列表读取期间仍可能有新增、删除或权限变化，结果不承诺是某个时刻的完整快照。缺少必要续页指针、游标不匹配或响应格式异常会报错，不会用空数组伪装为读取完毕。

## 保持现有发表与删除兼容

`send_qzone_msg` 保持原有参数，返回 `{tid, time}`；`time` 为服务端发表的 Unix 秒，未提供时按 SL 约定为 0，不使用本地时钟代替：

```json
{
  "content": "今天天气不错",
  "ugc_right": 64
}
```

纯文本发表使用内置空间接口。传入非空 `images` 时，继续使用原有 CGI 图片上传与发表逻辑，仍支持 `file://`、HTTP(S) 和 `base64://`。空图片数组按纯文本处理。临时图片在请求结束后清理，用户提供的本地图片不会删除。

对外权限编码保持不变：

| `ugc_right` | 可见范围 | `target_uins` |
| ---: | --- | --- |
| 1（默认） | 所有人 | 无需 |
| 4 | 好友 | 无需 |
| 16 | 指定好友 | 必须提供非空数组 |
| 64 | 仅自己 | 无需 |
| 128 | 排除指定好友 | 必须提供非空数组 |

内部会把纯文本的权限转换成新接口使用的编码；调用方继续使用上述原有值。`delete_qzone_msg` 继续使用既有的 `tid` 参数及 CGI 路径。

接口不会在新接口失败后自动通过旧 CGI 再次发表。网络中断、超时、已提交但缺少确认字段等情况可能表示写入结果未知；应先在列表或 QQ 中确认，避免重复发帖、评论或回复。

## 空间资料与访问管理

这四个动作参考 SnowLuma 的同名参数和返回结构，使用空间 Web CGI，沿用当前账号取票、请求限制及错误处理。

`get_qzone_profile` 不传参数时读取自己的空间名称和说明，指定 `target_uin` 时读取目标空间（需要有访问权限）。结果只返回 `name` 和 `description`，空字符串按原值保留。空间资料与 QQ 昵称、个性签名各自独立。

`set_qzone_profile` 仅修改当前账号的空间资料，至少提供一个字段；省略字段保留原值，空字符串显式清空。支持字符串、有限数字和布尔值，后两者按字符串提交。不能用 `target_uin` 指定其他账号。

```json
{
  "name": "我的空间",
  "description": "记录日常"
}
```

仅清空说明可传 `{ "description": "" }`。内部通过字段位图只提交指定的资料字段，不会一起改写其他空间资料。

`set_qzone_msg_right` 修改自己已发说说的可见权限，`tid` 来自读取或发表接口，`ugc_right/target_uins` 与发表时使用相同编码。16 和 128 仍需非空名单；账号字符串保持十进制原值，非法项会导致整个请求失败，不会静默移除。成功返回所请求的权限；服务端回显不一致时会报错，未单独回传权限值时，在成功状态确认后返回请求值。

```json
{
  "tid": "说说接口返回的实际 tid",
  "ugc_right": 16,
  "target_uins": ["10002", "10003"]
}
```

上游权限修改接口需要重新提交原正文和媒体。实现会先读取当前账号的完整说说，核对作者与 tid，再重建更新请求；相同说说的并发修改会报错。当前支持可完整重建的纯文字和图片说说，正文空白、图片顺序和媒体数据均须保留。视频、音乐、转发等未覆盖的内容形态或不完整图片信息会在更新前报错，避免只改权限却丢失内容。

`set_qzone_ban` 将指定 `user_id` 加入当前账号的空间黑名单；`enable:false` 解除拉黑，省略时为 `true`。它操作当前账号的空间黑名单，成功返回显式 `null`。

```json
{
  "user_id": "10002",
  "enable": false
}
```

## 错误与运行环境

当前 QQ 账号必须处于可取票的登录状态。接口会校验鉴权、HTTP 状态、业务 retcode 和各方法必需的响应对象；鉴权失败不会伪装成空列表，缺少业务结果不会伪装成操作成功。请求有超时和响应大小限制，且不会携带 Cookie 跟随重定向。

这些接口依赖腾讯空间服务，服务端接口与账号访问条件可能变化。自动化测试使用合成数据和模拟传输，不能代替实际账号的访问及写入验收。
