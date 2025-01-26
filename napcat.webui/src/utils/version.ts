/**
 * 版本号转为数字
 * @param version 版本号
 * @returns 版本号数字
 */
export const versionToNumber = (version: string): number => {
  const finalVersionString = version.replace(/^v/, '')

  const versionArray = finalVersionString.split('.')
  const versionNumber =
    parseInt(versionArray[2]) +
    parseInt(versionArray[1]) * 100 +
    parseInt(versionArray[0]) * 10000

  return versionNumber
}

/**
 * 比较版本号
 * @param version1 版本号1
 * @param version2 版本号2
 * @returns 比较结果
 * 0: 相等
 * 1: version1 > version2
 * -1: version1 < version2
 */
export const compareVersion = (version1: string, version2: string): number => {
  const versionNumber1 = versionToNumber(version1)
  const versionNumber2 = versionToNumber(version2)

  if (versionNumber1 === versionNumber2) {
    return 0
  }

  return versionNumber1 > versionNumber2 ? 1 : -1
}
