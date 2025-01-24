type HitokitoType =
  | 'a' /** 动画 */
  | 'b' /** 漫画 */
  | 'c' /** 游戏 */
  | 'd' /** 文学 */
  | 'e' /** 原创 */
  | 'f' /** 来自网络 */
  | 'g' /** 其他 */
  | 'h' /** 影视 */
  | 'i' /** 诗词 */
  | 'j' /** 网易云 */
  | 'k' /** 哲学 */
  | 'l' /** 抖机灵 */

interface IHitokoto {
  id: number
  uuid: string
  hitokoto: string
  type: HitokitoType
  from: string
  from_who: string
  creator: string
  creator_uid: number
  reviewer: number
  commit_from: string
  created_at: string
  length: number
}
