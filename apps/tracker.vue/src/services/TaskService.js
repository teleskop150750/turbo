import { http } from '../utils/http.js'

export const TaskService = {
  show(id) {
    return http.get(`api/v1/tasks/${id}`)
  },

  create(payload) {
    return http.post('api/v1/tasks', payload)
  },

  delete(id) {
    return http.post(`api/v1/delete-task/${id}`)
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

  getTasksUnassembled() {
    return http.get('api/v1/tasks-unassembled')
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

  /// ////////////////
  getMainTasks() {
    return http.get('api/v1/tasks-created-by-me')
  },

  getAssignedTasks() {
    return http.get('api/v1/assigned-tasks-for-me')
  },

  getWorkspaceGanttTasks() {
    return http.get('api/v1/workspace-gantt-tasks-for-me')
  },

  getMainGanttTasks() {
    return http.get('api/v1/gantt-tasks-created-by-me')
  },

  getAssignedGanttTasks() {
    return http.get('api/v1/gantt-assigned-tasks-for-me')
  },

  getSharedGanttTasks() {
    return http.get('api/v1/shared-gantt-tasks-for-me')
  },

  addFile(id, formData) {
    return http.post(`api/v1/tasks/${id}/add-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  downloadFile(id) {
    return http.get(`api/v1/task-file/${id}`)
  },

  removeFile(id) {
    return http.post(`api/v1/remove-task-file/${id}`)
  },
}
