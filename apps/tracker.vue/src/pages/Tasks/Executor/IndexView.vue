<script setup>
import { inject, ref } from 'vue'

import NChart from '../../../components/NChart/NChart.vue'
import NTasksTable from '../../../components/NTasksTable/NTasksTable.vue'
import NTrackerTabPanel from '../../../components/NTrackerTabPanel/NTrackerTabPanel.vue'
import { useLoading } from '../../../composables/useLoading.js'
import { useNotification } from '../../../composables/useNotification.js'
import { TaskService } from '../../../services/TaskService.js'
import { LAYOUT_DEFAULT_KEY } from '../../../tokens/layout-default.js'

const layout = inject(LAYOUT_DEFAULT_KEY)

layout.setTitle('Исполнитель')

const { open: openLoading, close: closeLoading } = useLoading()
const { open: openNotification } = useNotification()
const tasks = ref([])

async function getDataInit() {
  openLoading()
  try {
    await Promise.all([getTasks()])
  } catch (error) {
    if (error.data && error.data.title) {
      openNotification({
        title: 'Error',
        message: error.data.title,
        type: 'error',
      })
    }
  }
  closeLoading()
}

async function getTasks() {
  const response = await TaskService.getTasksExecutor()

  tasks.value = response.data.data
}

getDataInit()
</script>

<template>
  <NTrackerTabPanel>
    <template #table>
      <NTasksTable :data="tasks" />
    </template>
    <template #chart>
      <NChart :tasks="tasks" />
    </template>
  </NTrackerTabPanel>
</template>
