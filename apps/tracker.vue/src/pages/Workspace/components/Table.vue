<script setup>
import { NButton, NDropdown, NDropdownItem, NDropdownMenu, NIconFolder, NIconPlus } from '@nado/nado-vue-ui'
import { inject, ref } from 'vue'

import VTrackerTable from '../../../components/VTrackerTable/VTrackerTable.vue'
import { useLoading } from '../../../composables/useLoading.js'
import { useNotification } from '../../../composables/useNotification.js'
import { FolderService } from '../../../services/FolderService.js'
import { TaskService } from '../../../services/TaskService.js'
import { LAYOUT_DEFAULT_KEY } from '../../../tokens/layout-default.js'

const layout = inject(LAYOUT_DEFAULT_KEY)

layout.setTitle('Личное')
const { open: openLoading, close: closeLoading } = useLoading()
const { open: openNotification } = useNotification()
const isSending = ref(false)
const folders = ref([])

async function archiveFolder(id) {
  if (isSending.value === true) {
    return
  }

  isSending.value = true
  openLoading()

  try {
    await FolderService.update({ id, published: false })
    await getData()

    openNotification({
      title: 'Успех',
      message: 'Папка помещена в корзину',
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

async function getData() {
  try {
    await getFolders()
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

async function getFolders() {
  const response = await FolderService.getWorkspaceFoldersForMe()
  const responseFolders = response.data.data.folders

  folders.value = responseFolders
}

async function getDataInit() {
  openLoading()
  await getData()
  closeLoading()
}

getDataInit()
</script>

<template>
  <div class="page-workspace">
    <VTrackerTable v-if="folders.length > 1" :rows="folders">
      <template #default="{ row }">
        <template v-if="row.entityType === 'FOLDER'">
          <NDropdown>
            <NButton :icon="NIconPlus" />
            <template #dropdown>
              <NDropdownMenu>
                <NDropdownItem>
                  <NButton size="small" plain @click="archiveFolder(row.id)"> Архивировать </NButton>
                </NDropdownItem>
                <NDropdownItem>
                  <NButton size="small" plain @click="$router.push({ name: 'folders-update', params: { id: row.id } })">
                    Редактировать
                  </NButton>
                </NDropdownItem>
              </NDropdownMenu>
            </template>
          </NDropdown>
        </template>

        <template v-if="row.entityType === 'TASK'">
          <NDropdown>
            <NButton :icon="NIconPlus" />
            <template #dropdown>
              <NDropdownMenu>
                <NDropdownItem>
                  <NButton size="small" plain @click="archiveTask(row.id)"> Архивировать </NButton>
                </NDropdownItem>
                <NDropdownItem>
                  <NButton
                    size="small"
                    appearance="primary"
                    plain
                    @click="
                      $router.push({
                        name: 'tasks-update',
                        params: { id: row.id },
                      })
                    "
                  >
                    Редактировать
                  </NButton>
                </NDropdownItem>
              </NDropdownMenu>
            </template>
          </NDropdown>
        </template>
      </template>
    </VTrackerTable>
  </div>
</template>

<style>
.page-workspace {
  padding-top: 2rem;
}
</style>
