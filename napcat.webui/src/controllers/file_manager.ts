import toast from 'react-hot-toast'

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

  public static download(path: string) {
    const downloadUrl = `/File/download?path=${encodeURIComponent(path)}`
    toast
      .promise(
        serverRequest
          .post(downloadUrl, void 0, {
            responseType: 'blob'
          })
          .catch((e) => {
            console.error(e)
            throw new Error('下载失败')
          }),
        {
          loading: '正在下载文件...',
          success: '下载成功',
          error: '下载失败'
        }
      )
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        let fileName = path.split('/').pop() || ''
        if (path.split('.').length === 1) {
          fileName += '.zip'
        }
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  public static async batchDownload(paths: string[]) {
    const downloadUrl = `/File/batchDownload`
    toast
      .promise(
        serverRequest
          .post(
            downloadUrl,
            { paths },
            {
              responseType: 'blob'
            }
          )
          .catch((e) => {
            console.error(e)
            throw new Error('下载失败')
          }),
        {
          loading: '正在下载文件...',
          success: '下载成功',
          error: '下载失败'
        }
      )
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        const fileName = 'files.zip'
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  public static async downloadToURL(path: string) {
    const downloadUrl = `/File/download?path=${encodeURIComponent(path)}`
    const response = await serverRequest.post(downloadUrl, void 0, {
      responseType: 'blob'
    })
    return window.URL.createObjectURL(new Blob([response.data]))
  }

  public static async upload(path: string, files: File[]) {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    const { data } = await serverRequest.post<ServerResponse<boolean>>(
      `/File/upload?path=${encodeURIComponent(path)}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return data.data
  }

  public static async uploadWebUIFont(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await serverRequest.post<ServerResponse<boolean>>(
      '/File/font/upload/webui',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return data.data
  }

  public static async deleteWebUIFont() {
    const { data } = await serverRequest.post<ServerResponse<boolean>>(
      '/File/font/delete/webui'
    )
    return data.data
  }
}
