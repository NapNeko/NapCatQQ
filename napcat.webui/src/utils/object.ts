/**
 * 深拷贝
 * @param obj 需要拷贝的对象
 * @returns 拷贝后的对象
 */
export const deepClone = <T>(obj: T): T => {
  // 我们这里只只用于配置项，所以直接使用字符串就行
  const newObj = JSON.parse(JSON.stringify(obj))

  return newObj
}
