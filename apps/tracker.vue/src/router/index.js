import { createRouter, createWebHistory } from 'vue-router'

import { loadLayout } from './layout/loadLayout.js'
import auth from './middleware/auth.middleware.js'
import guest from './middleware/guest.middleware.js'
import middlewarePipeline from './middleware/middlewarePipeline.js'
import verify from './middleware/verify.middleware.js'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../pages/Home.vue'),
    meta: {
      layout: 'default',
      middleware: [auth, verify],
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/Login.vue'),
    meta: {
      layout: 'login',
      middleware: [guest],
    },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../pages/Register.vue'),
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
      middleware: [auth],
    },
  },
  {
    path: '/email/verification-notification',
    name: 'verification-notification',
    component: () => import('../pages/Auth/VerificationNotification/IndexView.vue'),
    meta: {
      layout: 'login',
      middleware: [auth],
    },
  },
  {
    path: '/archive',
    name: 'archive',
    component: () => import('../pages/Archive/Index.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
  },
  {
    path: '/workspace',
    name: 'workspace',
    component: () => import('../pages/Workspace/Index.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
  },
  {
    path: '/workspace-gantt',
    name: 'workspace-gantt',
    component: () => import('../pages/Workspace/Gantt.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
  },
  {
    path: '/shared',
    name: 'shared',
    component: () => import('../pages/Shared/Index.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
  },
  // {
  //   path: '/shared-gantt',
  //   name: 'shared-gantt',
  //   component: () => import('../pages/Shared/Gantt.vue'),
  //   meta: {
  //     layout: 'default',
  //     middleware: [auth],
  //   },
  // },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../pages/Profile/IndexView.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
  },
  {
    path: '/folders/create',
    name: 'folders-create',
    component: () => import('../pages/Folders/Create.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
  },
  {
    path: '/folders/update/:id',
    name: 'folders-update',
    component: () => import('../pages/Folders/Update.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
    props: true,
  },
  {
    path: '/tasks/create',
    name: 'tasks-create',
    component: () => import('../pages/Tasks/Create.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
  },
  {
    path: '/tasks/update/:id',
    name: 'tasks-update',
    component: () => import('../pages/Tasks/Update.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
    props: true,
  },
  {
    path: '/tasks/created',
    name: 'tasks-created',
    component: () => import('../pages/Tasks/Created/Index.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
  },
  {
    path: '/tasks/main',
    name: 'tasks-main',
    component: () => import('../pages/Tasks/Main/Index.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('../pages/Search.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../pages/NotFound.vue'),
    meta: { layout: 'error' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(loadLayout)

router.beforeEach((to, from, next) => {
  const { middleware } = to.meta
  const context = { to, from, next }

  if (!middleware) {
    next()
  } else {
    middleware[0]({
      ...context,
      next: middlewarePipeline(context, middleware, 1),
    })
  }
})

export default router
