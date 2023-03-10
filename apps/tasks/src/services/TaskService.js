import { http } from '../utils/http.js'

export const TaskService = {
  show(id) {
    return http.get(`api/v1/tasks/${id}`)
  },

  create(payload) {
    return http.post('api/v1/tasks', payload)
  },

  delete(id) {
    return http.delete(`api/v1/tasks/${id}`)
  },

  update(id, payload) {
    return http.put(`api/v1/tasks/${id}`, payload)
  },

  getTasks() {
    return http.get('api/v1/tasks')
  },

  getTasksAuthor() {
    return http.get('api/v1/tasks-author')
  },

  getTasksExecutor() {
    return http.get('api/v1/tasks-executor')
  },

  getTasksIndefinite() {
    return http.get('api/v1/tasks-indefinite')
  },

  getFolderMeTasks() {
    return http.get('api/v1/folder-me/tasks')
  },

  getFolderSharedTasks() {
    return http.get('api/v1/folder-shared/tasks')
  },

  getFolderTasks(folderId) {
    return http.get(`api/v1/folder/${folderId}/tasks`)
  },

  addFile(taskId, formData, params, chunk) {
    return http.postForm(`api/v1/tasks/${taskId}/files`, formData, {
      params,
      signal: chunk.getController()?.signal,
      onUploadProgress: (evt) => {
        chunk.handleUploadProgress(evt)
      },
    })
  },

  downloadFile(taskId, fileId) {
    return http.get(`api/v1/tasks/${taskId}/files/${fileId}`, {
      responseType: 'blob',
    })
  },

  removeFile(taskId, fileId) {
    return http.delete(`api/v1/tasks/${taskId}/files/${fileId}`)
  },
}
