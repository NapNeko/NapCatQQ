import { serverRequest } from '@/utils/request'

export interface FileInfo {
  name: string
  isDirectory: boolean
  size: number
  mtime: Date
}

export default class FileManager {
  public static async listFiles(path: string = '/') {
    const { data } = await serverRequest.get<ServerResponse<FileInfo[]>>(
      `/File/list?path=${encodeURIComponent(path)}`
    )
    return data.data
  }

  // 新增：按目录获取
  public static async listDirectories(path: string = '/') {
    const { data } = await serverRequest.get<ServerResponse<FileInfo[]>>(
      `/File/list?path=${encodeURIComponent(path)}&onlyDirectory=true`
    )
    return data.data
  }

  public static async createDirectory(path: string): Promise<boolean> {
    const { data } = await serverRequest.post<ServerResponse<boolean>>(
      '/File/mkdir',
      { path }
    )
    return data.data
  }

  public static async delete(path: string) {
    const { data } = await serverRequest.post<ServerResponse<boolean>>(
      '/File/delete',
      { path }
    )
    return data.data
  }

  public static async readFile(path: string) {
    const { data } = await serverRequest.get<ServerResponse<string>>(
      `/File/read?path=${encodeURIComponent(path)}`
    )
    return data.data
  }

  public static async writeFile(path: string, content: string) {
    const { data } = await serverRequest.post<ServerResponse<boolean>>(
      '/File/write',
      { path, content }
    )
    return data.data
  }

  public static async createFile(path: string): Promise<boolean> {
    const { data } = await serverRequest.post<ServerResponse<boolean>>(
      '/File/create',
      { path }
    )
    return data.data
  }

  public static async batchDelete(paths: string[]) {
    const { data } = await serverRequest.post<ServerResponse<boolean>>(
      '/File/batchDelete',
      { paths }
    )
    return data.data
  }

  public static async rename(oldPath: string, newPath: string) {
    const { data } = await serverRequest.post<ServerResponse<boolean>>(
      '/File/rename',
      { oldPath, newPath }
    )
    return data.data
  }

  public static async move(sourcePath: string, targetPath: string) {
    const { data } = await serverRequest.post<ServerResponse<boolean>>(
      '/File/move',
      { sourcePath, targetPath }
    )
    return data.data
  }

  public static async batchMove(
    items: { sourcePath: string; targetPath: string }[]
  ) {
    const { data } = await serverRequest.post<ServerResponse<boolean>>(
      '/File/batchMove',
      { items }
    )
    return data.data
  }
}
