/**
 * 路径截断工具函数
 *
 * 用于解决前端提示框中长路径导致内容溢出的问题。
 * 当错误消息包含过长的文件路径时，会导致提示框显示异常。
 *
 * 使用场景：
 * - Toast 消息中包含文件路径
 * - 错误提示中包含配置文件路径
 * - 任何可能因路径过长导致 UI 溢出的场景
 *
 * 兼容性：
 * - Windows 路径：D:\folder\subfolder\file (使用 \ 作为分隔符)
 * - Linux/Unix 路径：/home/user/folder/file (使用 / 作为分隔符)
 *
 * 示例：
 * - Windows: D:\NapCat.Shell-1\NapCat.Shell-2\...\data → D:\NapCat.Shell-1\...\napcat-plugin-builtin\data
 * - Linux: /home/user/projects/napcat/plugins/data → /home/user/...\plugins/data
 */

/**
 * 截断长路径，保留开头和结尾部分
 *
 * @param path - 需要截断的路径（支持 Windows 和 Linux 路径格式）
 * @param maxLength - 最大允许长度，默认 60 字符
 * @returns 截断后的路径，中间用 ... 替代
 *
 * @example
 * // Windows 路径
 * truncatePath('D:\\folder1\\folder2\\folder3\\file.txt', 30)
 * // 返回: 'D:\\...\\folder3\\file.txt'
 *
 * @example
 * // Linux 路径
 * truncatePath('/home/user/projects/deep/nested/file.txt', 30)
 * // 返回: '/home/user/.../nested/file.txt'
 */
export function truncatePath (path: string, maxLength: number = 60): string {
  if (path.length <= maxLength) {
    return path;
  }

  // 自动检测路径分隔符，兼容 Windows (\) 和 Linux/Unix (/)
  const separator = path.includes('\\') ? '\\' : '/';
  const parts = path.split(separator);

  if (parts.length <= 3) {
    // 如果路径段太少（如 D:\folder\file），直接尾部截断
    return path.substring(0, maxLength - 3) + '...';
  }

  // 保留第一段（Windows 驱动器号如 D: 或 Linux 根目录）和最后两段（父目录+文件名）
  const firstPart = parts[0];
  const lastParts = parts.slice(-2).join(separator);

  const truncated = `${firstPart}${separator}...${separator}${lastParts}`;

  // 如果截断后仍然超长，回退到简单的尾部截断
  if (truncated.length > maxLength) {
    return path.substring(0, maxLength - 3) + '...';
  }

  return truncated;
}

/**
 * 智能截断消息文本，特别处理包含路径的错误消息
 *
 * 此函数会自动检测消息中的文件路径（Windows 和 Linux 格式）并截断过长的路径，
 * 以防止 UI 组件（如 Toast、Alert）因内容过长而溢出。
 *
 * @param message - 需要处理的消息文本
 * @param maxLength - 最终消息的最大长度，默认 100 字符
 * @returns 处理后的消息，路径被截断，整体长度受限
 *
 * @example
 * // 处理包含 Windows 路径的错误消息
 * truncateErrorMessage("Save failed: Error updating config: EPERM: operation not permitted, open 'D:\\very\\long\\path\\config.json'")
 * // 返回: "Save failed: Error updating config: EPERM: operation not permitted, open 'D:\\...\\path\\config.json'"
 *
 * @example
 * // 处理包含 Linux 路径的错误消息
 * truncateErrorMessage("Failed to read /home/user/projects/napcat/very/deep/nested/config.json")
 * // 返回: "Failed to read /home/user/.../nested/config.json"
 */
export function truncateErrorMessage (message: string, maxLength: number = 100): string {
  if (message.length <= maxLength) {
    return message;
  }

  // Windows 路径正则：匹配 盘符:\路径 格式，如 D:\folder\file.txt
  // 排除空白字符和引号，避免匹配到路径外的内容
  const windowsPathRegex = /[A-Za-z]:\\[^\s'"]+/g;

  // Linux/Unix 路径正则：匹配 /开头的多级路径，如 /home/user/file
  // 要求至少有两级目录，避免匹配单独的 /
  const unixPathRegex = /\/[^\s'"]+(?:\/[^\s'"]+)+/g;

  let result = message;

  // 处理 Windows 路径
  const windowsPaths = message.match(windowsPathRegex);
  if (windowsPaths) {
    for (const path of windowsPaths) {
      if (path.length > 40) {
        result = result.replace(path, truncatePath(path, 40));
      }
    }
  }

  // 处理 Unix 路径
  const unixPaths = message.match(unixPathRegex);
  if (unixPaths) {
    for (const path of unixPaths) {
      if (path.length > 40) {
        result = result.replace(path, truncatePath(path, 40));
      }
    }
  }

  // 如果处理路径后消息仍然超长，直接尾部截断
  if (result.length > maxLength) {
    return result.substring(0, maxLength - 3) + '...';
  }

  return result;
}

/**
 * 截断普通文本（简单截断，不做路径检测）
 *
 * @param text - 需要截断的文本
 * @param maxLength - 最大长度，默认 50 字符
 * @returns 截断后的文本，超长部分用 ... 替代
 */
export function truncateText (text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}
