import { TSchema } from '@sinclair/typebox';

export interface OneBotHttpApiContent {
  description?: string;
  payload: TSchema;
  response: TSchema;
  payloadExample?: any;
}

export type OneBotHttpApi = Record<string, OneBotHttpApiContent>;

let oneBotHttpApi: OneBotHttpApi = {};

export async function fetchOneBotHttpApi (): Promise<OneBotHttpApi> {
  try {
    const response = await fetch('/api/Debug/schemas', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    if (data.code === 0) {
      oneBotHttpApi = data.data;
      return oneBotHttpApi;
    }
  } catch (error) {
    console.error('Failed to fetch OneBot HTTP API schemas:', error);
  }
  return {};
}

export function getOneBotHttpApi () {
  return oneBotHttpApi;
}

export type OneBotHttpApiPath = string;

export default oneBotHttpApi;

