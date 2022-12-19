<script setup>
import { inject, ref } from 'vue'

import VTrackerTable from '../../../components/VTrackerTable/VTrackerTable.vue'
import { FolderService } from '../../../services/FolderService.js'
import { LAYOUT_DEFAULT_KEY } from '../../../tokens/layout-default.js'

const layout = inject(LAYOUT_DEFAULT_KEY)

layout.setTitle('Доступные')
const folders = ref([])

async function getData() {
  getFolders()
}

async function getFolders() {
  const response = await FolderService.getSharedFoldersForMe()

  folders.value = response.data.data.folders
}

getData()
</script>

<template>
  <div class="page-shared">
    <VTrackerTable :rows="folders" />
  </div>
</template>

<style>
.page-shared {
  padding-top: 2rem;
  padding-bottom: 3rem;
}
</style>
