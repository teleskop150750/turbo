import { http } from '../utils/http.js'

export const FolderService = {
  update(payload) {
    return http.post('api/v1/update-folder', payload)
  },

  delete(id) {
    return http.post('api/v1/delete-folder', {}, { params: { id } })
  },

  create(payload) {
    return http.post('api/v1/create-folder', payload)
  },

  getFolder(id) {
    return http.get('api/v1/folder-info', { params: { id } })
  },

  getWorkspaceFoldersForMe() {
    return http.get('api/v1/workspace-folders-for-me')
  },

  getSharedFoldersForMe() {
    return http.get('api/v1/shared-folders-for-me')
  },

  getAvailableFoldersForMe() {
    return http.get('api/v1/available-folders-for-me')
  },
}
