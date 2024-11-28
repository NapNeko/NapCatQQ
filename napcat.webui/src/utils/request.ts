import axios from 'axios'
const baseURL = import.meta.env.VITE_BACKEND_URL

export const serverRequest = axios.create({
  baseURL: baseURL,
  timeout: 5000
})

export const request = axios.create({
  timeout: 5000
})

serverRequest.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers['Authorization'] = `Bearer ${JSON.parse(token)}`
  }

  return config
})

serverRequest.interceptors.response.use((response) => {
  if (response.data.code !== 0) {
    if (response.data.message === 'Unauthorized') {
      localStorage.removeItem('token')
      window.location.href = './#/web_login'
    }
    throw new Error(response.data.message)
  }

  return response
})
