<script setup>
import { NButton } from '@nado/nado-vue-ui'
import { inject, ref } from 'vue'

import VTrackerTable from '../../components/VTrackerTable/VTrackerTable.vue'
import { useLoading } from '../../composables/useLoading.js'
import { useNotification } from '../../composables/useNotification.js'
import { FolderService } from '../../services/FolderService.js'
import { TaskService } from '../../services/TaskService.js'
import { TrackerService } from '../../services/TrackerService.js'
import { LAYOUT_DEFAULT_KEY } from '../../tokens/layout-default.js'

const layout = inject(LAYOUT_DEFAULT_KEY)

layout.setTitle('Архив')
const { open: openLoading, close: closeLoading } = useLoading()
const { open: openNotification } = useNotification()

const items = ref([])
const isSending = ref(false)

async function publishFolder(id) {
  if (isSending.value === true) {
    return
  }

  isSending.value = true
  openLoading()

  try {
    await FolderService.update({ id, published: true })
    await getData()

    openNotification({
      title: 'Успех',
      message: 'Папка восстановлена',
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

async function deleteFolder(id) {
  if (isSending.value === true) {
    return
  }

  isSending.value = true
  openLoading()

  try {
    await FolderService.delete(id)
    await getData()

    openNotification({
      title: 'Успех',
      message: 'Папка удалена',
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

async function publishTask(id) {
  if (isSending.value === true) {
    return
  }

  isSending.value = true
  openLoading()

  try {
    await TaskService.update({ id, published: true })
    await getData()

    openNotification({
      title: 'Успех',
      message: 'Задача опубликована',
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

async function deleteTask(id) {
  if (isSending.value === true) {
    return
  }

  isSending.value = true
  openLoading()

  try {
    await TaskService.delete(id)
    await getData()

    openNotification({
      title: 'Успех',
      message: 'Задача удалена',
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

async function getData() {
  try {
    await getItems()
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

async function getItems() {
  const response = await TrackerService.getArchiveForMe()

  items.value = response.data.data.items
}

async function getDataInit() {
  openLoading()
  await getData()
  closeLoading()
}

getDataInit()
</script>

<template>
  <div class="page-archive">
    <VTrackerTable :rows="items">
      <template #default="{ row, level }">
        <template v-if="row.entityType === 'FOLDER'">
          <template v-if="level === 1">
            <NButton plain @click="publishFolder(row.id)"> Опубликовать </NButton>
          </template>
          <NButton size="small" plain @click="deleteFolder(row.id)"> Удалить </NButton>
          <NButton size="small" plain @click="$router.push({ name: 'folders-update', params: { id: row.id } })">
            Редактировать
          </NButton>
        </template>
        <template v-if="row.entityType === 'TASK'">
          <template v-if="level === 1">
            <NButton plain @click="publishTask(row.id)"> Опубликовать </NButton>
          </template>
          <NButton size="small" plain @click="deleteTask(row.id)"> Удалить </NButton>
          <NButton size="small" plain @click="$router.push({ name: 'tasks-update', params: { id: row.id } })">
            Редактировать
          </NButton>
        </template>
      </template>
    </VTrackerTable>
  </div>
</template>

<style>
.page-archive {
  padding-top: 2rem;
  padding-bottom: 3rem;
}
</style>
