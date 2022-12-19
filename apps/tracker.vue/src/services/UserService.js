import { http } from '../utils/http.js'

export const UserService = {
  sendNewEmail() {
    return http.post('api/v1/email/verification-notification')
  },

  forgotPassword(payload) {
    return http.post('api/v1/forgot-password', payload)
  },

  resetPassword(token, payload) {
    return http.post(`api/v1/reset-password/${token}`, payload)
  },

  verifyEmail(path) {
    return http.post(path)
  },

  register(payload) {
    return http.post('api/v1/register', payload)
  },

  updateProfile(payload) {
    return http.post('api/v1/update-me', payload)
  },

  changePassword(payload) {
    return http.post('api/v1/change-password', payload)
  },

  login(payload) {
    return http.post('api/v1/login', payload)
  },

  getUsers() {
    return http.get('api/v1/users')
  },
}
