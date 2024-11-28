/**
 * 休眠函数
 * @param ms 休眠时间
 * @returns Promise<void>
 */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 获取距离当前时间的发布时间
 * @param time 发布时间
 * @returns string
 * @example getReleaseTime("2021-10-10T10:10:10Z") => "1天前"
 */
export const getReleaseTime = (time: string) => {
  const releaseTime = new Date(time).getTime()
  const nowTime = new Date().getTime()
  const diffTime = nowTime - releaseTime
  const diffDays = Math.floor(diffTime / (24 * 3600 * 1000))
  const diffHours = Math.floor((diffTime % (24 * 3600 * 1000)) / (3600 * 1000))
  const diffMinutes = Math.floor((diffTime % (3600 * 1000)) / (60 * 1000))
  const diffSeconds = Math.floor((diffTime % (60 * 1000)) / 1000)

  if (diffDays > 0) {
    return `${diffDays}天前`
  } else if (diffHours > 0) {
    return `${diffHours}小时前`
  } else if (diffMinutes > 0) {
    return `${diffMinutes}分钟前`
  } else {
    return `${diffSeconds}秒前`
  }
}
