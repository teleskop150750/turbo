<script setup>
import { NButton } from '@nado/nado-vue-ui'
import { ref } from 'vue'

import VTrackerTable from '../../../../components/VTrackerTable/VTrackerTable.vue'
import { useLoading } from '../../../../composables/useLoading.js'
import { useNotification } from '../../../../composables/useNotification.js'
import { TaskService } from '../../../../services/TaskService.js'

const { open: openNotification } = useNotification()
const { open: openLoading, close: closeLoading } = useLoading()
const tasks = ref([])
const isSending = ref(false)

async function getData() {
  try {
    await getTasks()
  } catch (error) {
    if (error.data.message) {
      openNotification({
        title: 'Error',
        message: error.data.message,
        type: 'error',
      })
    }
  }
}

async function getTasks() {
  const response = await TaskService.getAssignedTasks()

  tasks.value = response.data.data.tasks
}

async function archiveTask(id) {
  if (isSending.value === true) {
    return
  }

  isSending.value = true
  openLoading()

  try {
    await TaskService.update({ id, published: false })
    await getData()

    openNotification({
      title: 'Успех',
      message: 'Задача помещена в корзину',
      type: 'success',
    })
  } catch (error) {
    if (error.data.message) {
      openNotification({
        title: 'Error',
        message: error.data.message,
        type: 'error',
      })
    }
  } finally {
    isSending.value = false
    closeLoading()
  }
}

async function getDataInit() {
  openLoading()
  await getData()
  closeLoading()
}

getDataInit()
</script>

<template>
  <div class="page-created-tasks">
    <VTrackerTable :rows="tasks">
      <template #default="{ row }">
        <NButton plain @click="archiveTask(row.id)"> Архивировать </NButton>
        <NButton plain @click="$router.push({ name: 'tasks-update', params: { id: row.id } })"> Редактировать </NButton>
      </template>
    </VTrackerTable>
  </div>
</template>

<style>
.page-created-tasks {
  padding-top: 2rem;
  padding-bottom: 3rem;
}
</style>
