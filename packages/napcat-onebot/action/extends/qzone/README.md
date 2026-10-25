# QQ 空间接口

接口名称沿用 SnowLuma 的 `qzone` 命名。好友动态、个人说说、详情、纯文本发表和赞评使用 QQ 内置空间的 H5 接口，身份凭据由当前登录的 QQ 账号内部取得。

## 接口与参数

以下为 OneBot action 的参数；调用方式与其他 OneBot HTTP / WebSocket 接口相同。

| Action | 参数 | 返回 data |
| --- | --- | --- |
| `get_qzone_feeds` | `cursor?` | `{feeds, has_more, next_cursor}` |
| `get_qzone_msg_list` | `target_uin?`，`cursor?` | `{msglist, has_more, next_cursor, seal_off_memory?}` |
| `get_qzone_msg_detail` | `feed_ref` | 规范化 Feed、原始 `feed`、`comments` |
| `send_qzone_msg` | `content`，`images?`，`ugc_right?`，`target_uins?` | `{tid}` |
| `delete_qzone_msg` | `tid` | `null`，沿用原有接口 |
| `like_qzone` | `feed_ref` | `null` |
| `unlike_qzone` | `feed_ref` | `null` |
| `comment_qzone` | `feed_ref`，`content`，`comment?`，`reply_user?` | `{comment_id, comment}` |

`target_uin` 为说说所属的 QQ 账号，省略时使用当前账号。数值和字符串形式都可传入。空间访问权限仍由 QQ 服务端判断，接口不改变目标空间的访问权限。

新列表接口使用游标分页；未提供 `page_num/count/pos/num` 的兼容映射，也不会伪造总条数。需要按数量展示时，由调用方在自己保留的页面数据中分页。

## 获取列表与续页

首次调用 `get_qzone_feeds` 可传空对象；`get_qzone_msg_list` 可传：

```json
{
  "target_uin": "10002"
}
```

读取结果中的 `has_more`，为 `true` 时将 `next_cursor` 原样作为下一次请求的 `cursor`。查询其他账号的个人说说时，续页仍须传相同的 `target_uin`。

游标绑定当前登录账号、接口类型和目标账号，不能混用；有效期为 10 分钟，并采用有界内存缓存。过期、重启、缓存被淘汰或账号改变后，重新从第一页获取。不要解析游标或自行拼接上游字段。

列表中的每项包含：

- `tid`、`user_id`、`content`、`time`、`images`、`comment_num`、`like_num`：便于展示的规范化字段。未能可靠提取时为 `null`；时间单位为 Unix 秒。
- `feed_ref`：详情、点赞和评论所需的完整操作引用，部分非标准 Feed 可能为 `null`。
- `feed`：保留上游返回的完整 Feed 结构，包含未规范化的字段。

`content = null` 表示该 Feed 的内容形状尚不能完整转换为纯文本，不表示正文为空。`images = null` 同理表示图片字段未能可靠提取。

`seal_off_memory` 为个人说说列表返回的封存状态对象，存在时原样保留。不要根据空数组推断账号没有历史说说。

## 详情与赞评

从列表项取出 `feed_ref`，原样传给 `get_qzone_msg_detail`、`like_qzone`、`unlike_qzone` 或 `comment_qzone`。

引用包含完整 `union_id`，并可能包含 `cell_feed_transfer`、域类型和点赞 key。不同字段用于不同业务对象，不能用 `tid` 补齐缺失字段，也不能假定 `uf_key/ugc_id/feed_id` 对现有帖子相等。引用缺失或无效时接口会报错。

`comment_qzone` 不传 `comment` 时发表一级评论。回复评论时，将详情返回的完整父评论对象传入 `comment`。默认回复父评论作者；回复楼中楼的其他用户时，额外传入从原始数据取得的 `reply_user`（含 `uin`，可附带 `uid/nick`）。`reply_user` 依赖 `comment`，不能单独提供。返回的 `comment` 为新评论或新回复的完整对象。

评论和回复目前支持纯文本；不提供图片评论参数。正文会转换为 QQ 空间的 RichMsg 文本段。正文不能为空或全为空白，最多 2000 个 UTF-16 代码单元（与所分析 QQ 编辑器一致）。

## 保持现有发表与删除兼容

`send_qzone_msg` 保持原有参数和 `{tid}` 返回结构：

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

## 错误与运行环境

当前 QQ 账号必须处于可取票的登录状态。接口会校验鉴权、HTTP 状态、业务 retcode 和各方法必需的响应对象；鉴权失败不会伪装成空列表，缺少业务结果不会伪装成操作成功。请求有超时和响应大小限制，且不会携带 Cookie 跟随重定向。

这些接口依赖腾讯空间服务，服务端接口与账号访问条件可能变化。自动化测试使用合成数据和模拟传输，不能代替实际账号的访问及写入验收。
