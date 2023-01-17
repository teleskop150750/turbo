import auth from './middleware/auth.middleware.js'

export const tasksRoutes = [
  {
    path: '/tasks/create',
    name: 'tasks-create',
    component: () => import('../pages/Task/Create/IndexView.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
  },
  {
    path: '/tasks/:id/update',
    name: 'task-update',
    component: () => import('../pages/Task/Update/IndexView.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
    props: true,
  },
  {
    path: '/all',
    name: 'tasks-all',
    component: () => import('../pages/Tasks/All/IndexView.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
  },
  {
    path: '/author',
    name: 'tasks-author',
    component: () => import('../pages/Tasks/Author/IndexView.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
  },
  {
    path: '/executor',
    name: 'tasks-executor',
    component: () => import('../pages/Tasks/Executor/IndexView.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
  },
  {
    path: '/indefinite',
    name: 'tasks-indefinite',
    component: () => import('../pages/Tasks/Indefinite/IndexView.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
  },
  {
    path: '/folders/:id/tasks',
    name: 'folder-tasks',
    component: () => import('../pages/Tasks/Folder/IndexView.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
    props: true,
  },
]
