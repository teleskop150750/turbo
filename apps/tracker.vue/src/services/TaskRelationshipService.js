import { http } from '../utils/http.js'

export const TaskRelationshipService = {
  getForTasks(taskIds) {
    return http.get('api/v1/tasks-relationships-for-tasks', { params: { taskIds } })
  },
}
