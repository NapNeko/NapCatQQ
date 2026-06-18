import axios from 'axios';

import key from '@/const/key';

export const serverRequest = axios.create({
  timeout: 30000, // 30秒，获取版本列表可能较慢
});

export const request = axios.create({
  timeout: 10000,
});

export const requestServerWithFetch = async (
  url: string,
  options: RequestInit
) => {
  const token = localStorage.getItem(key.token);

  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${JSON.parse(token)}`,
    };
  }

  const baseURL = '/api';

  const response = await fetch(baseURL + url, options);

  return response;
};

serverRequest.interceptors.request.use((config) => {
  const baseURL = '/api';

  config.baseURL = baseURL;

  const token = localStorage.getItem(key.token);

  if (token) {
    try {
      const parsedToken = JSON.parse(token);
      config.headers['Authorization'] = `Bearer ${parsedToken}`;
    } catch {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return config;
});

serverRequest.interceptors.response.use((response) => {
  if (response.headers['content-type'] === 'application/octet-stream') {
    return response;
  }
  if (response.data.code !== 0) {
    if (response.data.message === 'Unauthorized') {
      const token = localStorage.getItem(key.token);
      if (token) {
        localStorage.removeItem(key.token);
        window.location.reload();
      }
    }
    throw new Error(response.data.message);
  }

  return response;
});
