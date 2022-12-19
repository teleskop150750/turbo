import axios from 'axios'

import { useUserStore } from '../store/user.js'

export const http = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  const userStore = useUserStore()

  if (userStore.check().value) {
    config.headers['user-id'] = userStore.id().value
  }

  return config
})

http.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success && response.data.success !== true) {
      return Promise.reject(response)
    }

    return response
  },
  (error) => {
    if (!error.data) {
      error.data = { message: 'Неизвестная ошибка' }
    }

    return Promise.reject(error)
  },
)
