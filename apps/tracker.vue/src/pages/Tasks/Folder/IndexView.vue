<script setup>
import { computed, inject, ref } from 'vue'
import { useRoute } from 'vue-router'

import NChart from '../../../components/NChart/NChart.vue'
import NTasksTable from '../../../components/NTasksTable/NTasksTable.vue'
import NTrackerTabPanel from '../../../components/NTrackerTabPanel/NTrackerTabPanel.vue'
import { useLoading } from '../../../composables/useLoading.js'
import { useNotification } from '../../../composables/useNotification.js'
import { FolderService } from '../../../services/FolderService.js'
import { TaskService } from '../../../services/TaskService.js'
import { LAYOUT_DEFAULT_KEY } from '../../../tokens/layout-default.js'

const layout = inject(LAYOUT_DEFAULT_KEY)

layout.setTitle('Папка')
const route = useRoute()
const { open: openLoading, close: closeLoading } = useLoading()
const { open: openNotification } = useNotification()
const tasks = ref([])

const tableTasks = computed(() =>
  tasks.value.filter((taskEl) => taskEl.folders.some((folderEl) => folderEl.id === route.params.id)),
)

async function getDataInit() {
  openLoading()
  try {
    await Promise.all([getTasks(), getFolder()])
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
  const response = await TaskService.getFolderTasks(route.params.id)

  tasks.value = response.data.data
}

async function getFolder() {
  const response = await FolderService.getFolder(route.params.id)
  const responseFolder = response.data.data

  layout.setTitle(responseFolder.name)
}

getDataInit()
</script>

<template>
  <NTrackerTabPanel>
    <template #table>
      <NTasksTable :data="tableTasks" />
    </template>
    <template #chart>
      <NChart :tasks="tasks" />
    </template>
  </NTrackerTabPanel>
</template>
