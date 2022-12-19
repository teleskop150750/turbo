<script setup>
import { NButton, NFormItem, NInput } from '@nado/nado-vue-ui'
import { inject, reactive, ref } from 'vue'

import VTitle from '../components/VTitle/VTitle.vue'
import VTrackerTable from '../components/VTrackerTable/VTrackerTable.vue'
import { useLoading } from '../composables/useLoading.js'
import { TrackerService } from '../services/TrackerService.js'
import { LAYOUT_DEFAULT_KEY } from '../tokens/layout-default.js'

const layout = inject(LAYOUT_DEFAULT_KEY)

layout.setTitle('Поиск')
const { open: openLoading, close: closeLoading } = useLoading()
const folders = ref([])
const tasks = ref([])
const formData = reactive({ search: '' })

async function submitForm() {
  openLoading()
  const response = await TrackerService.search(formData.search)

  folders.value = response.data.data.folders
  tasks.value = response.data.data.tasks
  closeLoading()
}

submitForm()
</script>

<template>
  <div class="page-search">
    <div class="page-search__search">
      <NFormItem>
        <NInput v-model="formData.search" autocomplete="off">
          <template #append>
            <NButton appearance="primary" @click="submitForm()"> Поиск </NButton>
          </template>
        </NInput>
      </NFormItem>
    </div>

    <div class="page-search__title">
      <VTitle level="2">Задачи</VTitle>
    </div>

    <VTrackerTable :rows="tasks" :tree="false">
      <template v-if="false" #default="{ row }">
        <template v-if="row.entityType === 'FOLDER'">
          <NButton size="small" plain> Архивировать </NButton>
          <NButton size="small" plain @click="$router.push({ name: 'folders-update', params: { id: row.id } })">
            Редактировать
          </NButton>
        </template>
        <template v-if="row.entityType === 'TASK'">
          <NButton size="small" plain> Архивировать </NButton>
          <NButton size="small" plain @click="$router.push({ name: 'folders-update', params: { id: row.id } })">
            Редактировать
          </NButton>
        </template>
      </template>
    </VTrackerTable>

    <div class="page-search__title">
      <VTitle level="2">Папки</VTitle>
    </div>

    <VTrackerTable :rows="folders" :show-filter="false" :tree="false">
      <template v-if="false" #default="{ row }">
        <template v-if="row.entityType === 'FOLDER'">
          <NButton plain> Архивировать </NButton>
          <NButton plain @click="$router.push({ name: 'folders-update', params: { id: row.id } })">
            Редактировать
          </NButton>
        </template>
        <template v-if="row.entityType === 'TASK'">
          <NButton plain> Архивировать </NButton>
          <NButton plain @click="$router.push({ name: 'folders-update', params: { id: row.id } })">
            Редактировать
          </NButton>
        </template>
      </template>
    </VTrackerTable>
  </div>
</template>

<style>
.page-search {
  padding-top: 2rem;
  padding-bottom: 3rem;
}

.page-search__search {
  width: 300px;
  padding: 0 1rem;
}

.page-search__title {
  padding: 0 1rem;
}
</style>
