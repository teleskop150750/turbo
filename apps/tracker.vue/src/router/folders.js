import auth from './middleware/auth.middleware.js'

export const foldersRoutes = [
  {
    path: '/folders/create',
    name: 'folders-create',
    component: () => import('../pages/Folder/Create/IndexView.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
  },
  {
    path: '/folders/:id/update',
    name: 'folder-update',
    component: () => import('../pages/Folder/Update/IndexView.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
    props: true,
  },
  {
    path: '/folder-me',
    name: 'folder-me',
    component: () => import('../pages/Tasks/FolderMe/IndexView.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
  },
  {
    path: '/folder-shared',
    name: 'folder-shared',
    component: () => import('../pages/Tasks/FolderShared/IndexView.vue'),
    meta: {
      layout: 'default',
      middleware: [auth],
    },
  },
]
