import { createRouter, createWebHistory } from 'vue-router'

import { authRoutes } from './auth.js'
import { foldersRoutes } from './folders.js'
import { loadLayout } from './layout/loadLayout.js'
import auth from './middleware/auth.middleware.js'
import middlewarePipeline from './middleware/middlewarePipeline.js'
import verify from './middleware/verify.middleware.js'
import { tasksRoutes } from './tasks.js'

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
    path: '/test',
    name: 'test',
    component: () => import('../pages/test/Test.vue'),
    meta: {
      layout: 'login',
    },
  },
  ...authRoutes,
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../pages/Profile/IndexView.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
  },

  ...foldersRoutes,
  ...tasksRoutes,
  {
    path: '/menu-edit',
    name: 'menu-edit',
    component: () => import('../pages/MenuEdit/IndexView.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('../pages/Search/IndexView.vue'),
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
