import { http } from '../utils/http.js'

export const TrackerService = {
  search(search) {
    return http.get('api/v1/search', { params: { search } })
  },

  getArchiveForMe() {
    return http.get('api/v1/archive-for-me')
  },
}
