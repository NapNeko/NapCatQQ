# 空友爱看扩展接口

这些接口通过已登录 QQ 的空间服务读取和操作「友爱看」公开动态，API 名称及参数与 SnowLuma 的公开接口保持兼容。接口能力受 QQ 版本、账号权限和服务端状态影响，可先调用 `get_qzone_public_capabilities` 查看当前能力。

## 调用约定

- `feed` 必须使用 `get_qzone_public_feeds` 返回的完整动态对象。不要只传 `tid`、`feed_ref` 或自行构造的摘要对象。
- `comment`、`reply` 必须使用详情或分页结果返回的完整对象，保留 `like.id`、游标及所有未知字段。接口会将对象交给核心 API，保留其原始字段。
- 发表或回复回执中的对象可能包含临时标识，与后续读取结果不同。后续回复、点赞和删除应先重新读取评论或回复，再使用读取结果中的完整对象；写入回执仍保留上游原样数据。
- `content` 接受长度大于零的文本或非空富文本对象数组，空白文本会保留。JSON 数组文本会先解析，再按非空对象数组校验；解析失败则保留原始文本。数组成员必须是 JSON 对象，富文本对象的未知字段会保留。空字符串、空数组和数字、布尔值等原始类型会被拒绝。
- `enable` 默认为 `true`，支持布尔值、任意数字（`0` 为 `false`，其余为 `true`）及文本 `true` / `false` / `1` / `0` / `yes` / `no` / `on` / `off`，文本忽略大小写及两端空白。
- `page_size` 默认为 `20`，接受有限数字或非空数值字符串，向零截断后必须大于等于 `1`。例如 `1.9` 归一为 `1`，`" 2e1 "` 归一为 `20`。
- `cursor`、`reason` 接受文本，也兼容数字、布尔值转为文本。动态列表的 `cursor` 不能为空且最长 65536 字符；评论 `cursor` 为必填非空值。
- 除动态列表的三个分页字段外，返回值采用开放的 JSON 对象结构。服务端返回的额外字段会保留，不额外添加 `success` 等字段。

所有接口都使用标准 OneBot 响应封装。下表和示例中的返回值指封装内的 `data`。

HTTP GET 查询参数、POST 查询参数及 URLencoded 表单值会逐项尝试 JSON 解码，因此可以将完整 `feed`、`comment`、`reply` 序列化后传入。JSON POST 和 WebSocket 的对象字段仍必须直接传 JSON 对象。查询或表单中的 `content=123` 会解码为数字并被拒绝；需要发送文本 `123` 时，应传 JSON 字符串 `"123"`。

## 接口

| API | 参数 | 用途 |
| --- | --- | --- |
| `get_qzone_public_capabilities` | `{}` | 查询当前接口能力 |
| `get_qzone_public_feeds` | `cursor?` | 读取动态列表及分页信息 |
| `get_qzone_public_feed_detail` | `feed` | 读取动态详情及评论初始游标 |
| `get_qzone_public_comments` | `feed`, `cursor` | 读取评论；`cursor` 必填 |
| `get_qzone_public_replies` | `feed`, `comment`, `cursor?`, `page_size?` | 读取评论回复 |
| `set_qzone_public_upvote` | `feed`, `enable?` | 推或取消推 |
| `set_qzone_public_like` | `feed`, `enable?` | 设置或取消普通赞 |
| `set_qzone_public_follow` | `feed`, `enable?` | 蹲或取消蹲作者 |
| `set_qzone_public_comment_like` | `feed`, `comment`, `reply?`, `enable?` | 设置或取消评论赞；提供 `reply` 时操作该回复 |
| `comment_qzone_public_feed` | `feed`, `content` | 发表评论 |
| `reply_qzone_public_feed` | `feed`, `comment`, `content`, `reply?` | 回复评论或指定的回复 |
| `delete_qzone_public_comment` | `feed`, `comment` | 删除评论 |
| `delete_qzone_public_reply` | `feed`, `comment`, `reply` | 删除回复 |
| `forward_qzone_public_feed` | `feed`, `reason?` | 转发动态；`reason` 默认为空字符串 |

推 `upvote` 和普通赞 `like` 是两个独立操作，应按需要分别调用。

## 动态和评论分页

```ts
// call 表示调用现有 OneBot HTTP / WebSocket API 并取出响应 data。
const first = await call('get_qzone_public_feeds', {});
// first: { feeds: [...], has_more: boolean, next_cursor: string | null, ... }
const feed = first.feeds[0];

if (first.has_more && first.next_cursor !== null) {
  const next = await call('get_qzone_public_feeds', { cursor: first.next_cursor });
}

if (feed) {
  const detail = await call('get_qzone_public_feed_detail', { feed });
  // 首批评论位于 detail.feed.feed.cell_comment.comments。
  if (detail.has_more === true && typeof detail.attach_info === 'string' && detail.attach_info !== '') {
    const comments = await call('get_qzone_public_comments', {
      feed,
      cursor: detail.attach_info,
    });
  }
}
```

动态详情已包含首批评论，位于 `feed.feed.cell_comment.comments`。继续翻页时使用详情或上一次评论结果返回的非空 `attach_info`；评论结果保留上游原始结构。

回复接口的 `cursor` 默认为空字符串；空字符串时，核心 API 使用 `comment.reply_attach_info`。继续翻页时传入上一次回复结果给出的 `reply_attach_info`。

```ts
const replies = await call('get_qzone_public_replies', {
  feed,
  comment, // 使用详情或评论结果中的完整对象
  page_size: 20,
});
```

## 互动示例

```ts
await call('set_qzone_public_upvote', { feed, enable: true });
await call('set_qzone_public_like', { feed, enable: false });
await call('comment_qzone_public_feed', { feed, content: '很有意思' });
await call('reply_qzone_public_feed', { feed, comment, content: '谢谢分享' });
await call('set_qzone_public_comment_like', { feed, comment, reply, enable: true });
await call('forward_qzone_public_feed', { feed, reason: '分享一条动态' });
```

每个 action 都提供 TypeBox 参数、返回值 schema 和示例，经 `action/index.ts` 注册后参与现有 OpenAPI 生成流程。富文本内容遵循 QQ 返回的对象格式；本扩展不定义新的富文本元素格式。
