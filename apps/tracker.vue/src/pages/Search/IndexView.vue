<script setup>
import { NScrollbar } from '@nado/nado-vue-ui'
import { inject, ref } from 'vue'

import NFoldersTable from '../../components/NFoldersTable/NFoldersTable.vue'
import NTasksTable from '../../components/NTasksTable/NTasksTable.vue'
import VTitle from '../../components/VTitle/VTitle.vue'
import { useLoading } from '../../composables/useLoading.js'
import { useNotification } from '../../composables/useNotification.js'
import { FolderService } from '../../services/FolderService.js'
import { TaskService } from '../../services/TaskService.js'
import { LAYOUT_DEFAULT_KEY } from '../../tokens/layout-default.js'

const layout = inject(LAYOUT_DEFAULT_KEY)

layout.setTitle('Поиск')
const { open: openLoading, close: closeLoading } = useLoading()
const { open: openNotification } = useNotification()
const folders = ref([])
const tasks = ref([])

async function getDataInit() {
  openLoading()
  try {
    await Promise.all([getFolders(), getTasks()])
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

async function getFolders() {
  const response = await FolderService.getFolders()
  const responseFolders = response.data.data

  folders.value = responseFolders
}

async function getTasks() {
  const response = await TaskService.getTasks()

  tasks.value = response.data.data
}

getDataInit()
</script>

<template>
  <NScrollbar>
    <div class="page-search">
      <div class="page-search-box">
        <VTitle class="page-search-box__title" level="2">Папки</VTitle>

        <div class="page-search-box__table">
          <NFoldersTable :data="folders" />
        </div>
      </div>

      <div class="page-search-box">
        <VTitle class="page-search-box__title" level="2">Задачи</VTitle>

        <div class="page-search-box__table">
          <NTasksTable :data="tasks" />
        </div>
      </div>
    </div>
  </NScrollbar>
</template>

<style>
.page-search {
  padding-top: 2rem;
  padding-right: 1rem;
  padding-bottom: 3rem;
}

.page-search-box + .page-search-box {
  margin-top: 2rem;
}

.page-search-box__title {
  margin: 0;
  margin-bottom: 1rem;
  padding: 0 1rem;
}

.page-search-box__table {
  height: 400px;
}
</style>
