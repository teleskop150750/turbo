<script setup>
import { DefaultTheme, Gantt } from '@dhtmlx/trial-vue-gantt'
import { ElCard, ElCol, ElForm, ElFormItem, ElRow, ElSelectV2 } from 'element-plus'
import { computed, reactive, ref } from 'vue'

import { useLoading } from '../../composables/useLoading.js'
import { useNotification } from '../../composables/useNotification.js'
import { TaskRelationshipService } from '../../services/TaskRelationshipService.js'
import { TaskService } from '../../services/TaskService.js'

const scales = [
  { unit: 'month', step: 1, format: 'MMMM yyy' },
  { unit: 'day', step: 1, format: 'd' },
]

const columns = [
  { name: 'text', label: 'Task name', width: '100px' },
  // { name: 'startDate', label: 'Start Date', align: 'center' },
  // { name: 'endDate', label: 'End Date', align: 'center' },
  { name: 'authorLabel', label: 'author', align: 'center' },
  { name: 'executorsLabel', label: 'executors', width: '100px' },
  // { name: 'duration', label: 'Duration', width: '70px', align: 'center' },
  // {
  //   name: 'add-task', label: '', width: '50px', align: 'center',
  // },
]

const { open: openNotification } = useNotification()
const { open: openLoading, close: closeLoading } = useLoading()
const tasks = ref([])
const relationships = ref([])

const filterData = reactive({ executorIds: [] })
const executors = computed(() => {
  const users = []

  tasks.value.forEach((item) => {
    item.executors.forEach((executor) => {
      users.push(executor)
    })
  })

  const userIds = new Set()

  const usersUnique = users.filter((user) => {
    if (userIds.has(user.id)) {
      return false
    }

    userIds.add(user.id)

    return true
  })

  const usersFormat = usersUnique.map((user) => ({
    id: user.id,
    value: user,
    label: `${user.fullName.firstName[0]}. ${user.fullName.lastName}`,
  }))

  return usersFormat
})

const filteredTasks = computed(() => {
  if (filterData.executorIds.length === 0) {
    return tasks.value
  }

  const items = [...tasks.value]

  const res = items.filter((line) => {
    const executorIds = line.executors.map((executor) => executor.id)
    let isInclude = false

    executorIds.forEach((id) => {
      if (filterData.executorIds.includes(id)) {
        isInclude = true
      }
    })

    return isInclude
  })

  return res
})

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
  const response = await TaskService.getWorkspaceGanttTasks()
  const responseTasks = response.data.data.tasks

  const ids = responseTasks.map((el) => el.id) || []

  await getTasksRelationships(ids)
  tasks.value = response.data.data.tasks
}

async function getTasksRelationships(ids = []) {
  const response = await TaskRelationshipService.getForTasks(ids)

  relationships.value = response.data.data.relationships
}

async function getDataInit() {
  openLoading()
  await getData()
  closeLoading()
}

getDataInit()
</script>

<template>
  <ElRow :gutter="20">
    <ElCol :span="4">
      <ElCard shadow="never">
        <ElForm label-position="top">
          <ElFormItem label="Исполнители">
            <ElSelectV2
              v-model="filterData.executorIds"
              :options="executors"
              value-key="id"
              clearable
              filterable
              multiple
              collapse-tags
              collapse-tags-tooltip
              style="width: 100%"
              placeholder="Выберите"
            >
              <template #default="{ item }">
                <span>{{ item.label }}</span>
              </template>
            </ElSelectV2>
          </ElFormItem>
        </ElForm>
      </ElCard>
    </ElCol>
  </ElRow>
  <div class="main-gantt">
    <DefaultTheme>
      <Gantt :tasks="filteredTasks" :links="relationships" :scales="scales" :columns="columns" />
    </DefaultTheme>
  </div>
</template>

<style>
.main-gantt {
  width: 100%;
  height: 100%;
}

.main-gantt .grid {
  overflow: auto !important;
}

.main-gantt .grid .cell {
  white-space: nowrap;

  overflow: auto !important;
}
</style>
