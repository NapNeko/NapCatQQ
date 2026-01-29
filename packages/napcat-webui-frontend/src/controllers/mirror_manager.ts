import { EventSourcePolyfill } from 'event-source-polyfill';
import { serverRequest } from '@/utils/request';
import key from '@/const/key';

export interface MirrorTestResult {
  mirror: string;
  latency: number;
  success: boolean;
  error?: string;
}

export interface MirrorListResponse {
  fileMirrors: string[];
  rawMirrors: string[];
  customMirror?: string;
  timeout: number;
}

export default class MirrorManager {
  /**
   * 获取镜像列表
   */
  public static async getMirrorList (): Promise<MirrorListResponse> {
    const { data } = await serverRequest.get<ServerResponse<MirrorListResponse>>('/Mirror/List');
    return data.data;
  }

  /**
   * 设置自定义镜像
   */
  public static async setCustomMirror (mirror: string): Promise<void> {
    await serverRequest.post('/Mirror/SetCustom', { mirror });
  }

  /**
   * 测试单个镜像
   */
  public static async testSingleMirror (mirror: string, type: 'file' | 'raw' = 'file'): Promise<MirrorTestResult> {
    const { data } = await serverRequest.post<ServerResponse<MirrorTestResult>>('/Mirror/Test', { mirror, type });
    return data.data;
  }

  /**
   * SSE 实时测速所有镜像
   */
  public static testMirrorsSSE (
    type: 'file' | 'raw' = 'file',
    callbacks: {
      onStart?: (data: { total: number; message: string; }) => void;
      onTesting?: (data: { index: number; total: number; mirror: string; message: string; }) => void;
      onResult?: (data: { index: number; total: number; result: MirrorTestResult; }) => void;
      onComplete?: (data: { results: MirrorTestResult[]; failed: MirrorTestResult[]; fastest: MirrorTestResult | null; message: string; }) => void;
      onError?: (error: string) => void;
    }
  ): EventSourcePolyfill {
    const token = localStorage.getItem(key.token);
    if (!token) {
      throw new Error('未登录');
    }
    const _token = JSON.parse(token);

    const eventSource = new EventSourcePolyfill(
      `/api/Mirror/Test/SSE?type=${type}`,
      {
        headers: {
          Authorization: `Bearer ${_token}`,
          Accept: 'text/event-stream',
        },
        withCredentials: true,
      }
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'start':
            callbacks.onStart?.(data);
            break;
          case 'testing':
            callbacks.onTesting?.(data);
            break;
          case 'result':
            callbacks.onResult?.(data);
            break;
          case 'complete':
            callbacks.onComplete?.(data);
            eventSource.close();
            break;
          case 'error':
            callbacks.onError?.(data.error);
            eventSource.close();
            break;
        }
      } catch (e) {
        console.error('Failed to parse SSE message:', e);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE连接出错:', error);
      callbacks.onError?.('连接中断');
      eventSource.close();
    };

    return eventSource;
  }
}
