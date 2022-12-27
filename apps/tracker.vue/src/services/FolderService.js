import { http } from '../utils/http.js'

export const FolderService = {
  delete(id) {
    return http.post('api/v1/delete-folder', {}, { params: { id } })
  },

  getFolder(id) {
    return http.get(`api/v1/folders/${id}`)
  },

  getWorkspaceFoldersForMe() {
    return http.get('api/v1/workspace-folders-for-me')
  },

  getSharedFoldersForMe() {
    return http.get('api/v1/shared-folders-for-me')
  },

  getFolders() {
    return http.get('api/v1/folders')
  },

  create(payload) {
    return http.post('api/v1/folders', payload)
  },

  update(id, payload) {
    return http.put(`api/v1/folders/${id}`, payload)
  },
}
