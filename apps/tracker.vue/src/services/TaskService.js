import { http } from '../utils/http.js'

export const TaskService = {
  create(payload) {
    return http.post('api/v1/create-task', payload)
  },

  delete(id) {
    return http.post(`api/v1/delete-task/${id}`)
  },

  update(payload) {
    return http.post('api/v1/update-task', payload)
  },

  getTask(id) {
    return http.get(`api/v1/task-info/${id}`)
  },

  getAvailableTasks() {
    return http.get('api/v1/available-tasks-for-me')
  },

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
