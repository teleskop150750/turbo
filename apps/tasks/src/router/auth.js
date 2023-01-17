import authUnverify from './middleware/authUnverify.middleware.js'
import guest from './middleware/guest.middleware.js'

export const authRoutes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/Auth/Login/IndexView.vue'),
    meta: {
      layout: 'login',
      middleware: [guest],
    },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../pages/Auth/Register/IndexView.vue'),
    meta: {
      layout: 'login',
      middleware: [guest],
    },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('../pages/Auth/ForgotPassword/IndexView.vue'),
    meta: {
      layout: 'login',
      middleware: [guest],
    },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('../pages/Auth/ResetPassword/IndexView.vue'),
    meta: {
      layout: 'login',
      middleware: [guest],
    },
  },
  {
    path: '/email/verify',
    name: 'email-verify',
    component: () => import('../pages/Auth/VerifyEmail/IndexView.vue'),
    meta: {
      layout: 'login',
      middleware: [authUnverify],
    },
  },
  {
    path: '/email/verification-notification',
    name: 'verification-notification',
    component: () => import('../pages/Auth/VerificationNotification/IndexView.vue'),
    meta: {
      layout: 'login',
      middleware: [authUnverify],
    },
  },
]
