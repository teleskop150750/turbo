<script setup>
// @ts-ignore
import { NForm, NFormItem, NSelectV2, NTag } from '@nado/nado-vue-ui'
import { computed, reactive } from 'vue'

import { IMPORTANCE, STATUSES } from '../../tracker/task.js'
import VTable from '../VTable/VTable.vue'

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  showFilter: {
    type: Boolean,
    default: true,
  },
  tree: {
    type: Boolean,
    default: true,
  },
})

const columns = [
  // { field: 'index' },
  // {
  //     text: 'Тип',
  //     field: 'entityType',
  // },
  // {
  //     text: 'type',
  //     field: 'type',
  // },
  // {
  //     text: 'access',
  //     field: 'access',
  // },
  {
    text: 'Название',
    field: 'name',
    expander: true,
  },
  {
    text: 'Участники',
    field: 'allInheritSharedUsers',
  },
  // {
  //     text: 'In',
  //     field: 'inheritSharedUsers',
  // },
  // {
  //     text: 'Shared',
  //     field: 'sharedUsers',
  // },
  {
    text: 'Исполнители',
    field: 'executors',
  },
  {
    text: 'Статус',
    field: 'status',
  },
  {
    text: 'Важность',
    field: 'importance',
  },
  {
    text: 'Дата начала',
    field: 'startDate',
  },
  {
    text: 'Срок выполнения',
    field: 'endDate',
  },
  {
    text: 'Автор',
    field: 'author',
  },
  {
    text: 'Дата создания',
    field: 'createdAt',
  },
  {
    text: 'Действия',
    field: 'actions',
  },
]

const propsLines = computed(() => [...props.rows])
const lines = computed(() => {
  const items = [...propsLines.value]

  return items.filter((item) => {
    // @ts-ignore
    if (item.entityType !== 'FOLDER') {
      return true
    }

    // @ts-ignore
    if (item.type !== 'ROOT') {
      return true
    }

    return false
  })
})

const filterData = reactive({ executorIds: [] })

const executors = computed(() => {
  const users = []

  propsLines.value.forEach((item) => {
    // @ts-ignore
    if (item.entityType === 'TASK') {
      // @ts-ignore
      item.executors.forEach((executor) => {
        users.push(executor)
      })
    }
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

const filteredLines = computed(() => {
  if (filterData.executorIds.length === 0) {
    return lines.value
  }

  const items = [...lines.value]

  return items.filter((line) => {
    // @ts-ignore
    if (line.entityType === 'FOLDER') {
      return true
    }

    // @ts-ignore
    const executorIds = line.executors.map((executor) => executor.id)

    let isInclude = false

    executorIds.forEach((id) => {
      if (filterData.executorIds.includes(id)) {
        isInclude = true
      }
    })

    return isInclude
  })
})

const tree = computed(() => {
  if (!props.tree) {
    return [...filteredLines.value]
  }

  const items = [...filteredLines.value]
  const hashTable = {}
  const result = []

  items.forEach((item) => {
    // @ts-ignore
    hashTable[item.id] = item
    // @ts-ignore
    hashTable[item.id].children = []
  })

  Object.values(hashTable).forEach((hashItem) => {
    const parentId = hashItem.parentId || null

    if (!Object.hasOwn(hashTable, parentId)) {
      hashItem.parentId = null
      result.push(hashItem)
    } else {
      hashTable[parentId].children.push(hashItem)
    }
  })

  return result
})

function convertDate(value) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  return `${date.getDay()}.${date.getMonth()}.${date.getFullYear()}`
}
</script>

<template>
  <div v-if="showFilter" class="n-tracker-table-filter">
    <NForm label-position="top">
      <NFormItem label="Исполнители">
        <NSelectV2
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
        </NSelectV2>
      </NFormItem>
    </NForm>
  </div>

  <VTable v-if="tree.length > 0" :columns="columns" :rows="tree">
    <!-- <template #body-cell-index="{ index }">
          {{ index }}
        </template> -->
    <template #body-cell-entityType="{ row }">
      {{ row.entityType }}
    </template>
    <template #body-cell-status="{ row }">
      <template v-if="row.entityType === 'TASK'">
        <div class="table-task-status">
          <span class="table-task-status__color" :style="{ '--task-status-color': STATUSES[row.status].color }" />
          <span class="table-task-status__label">
            {{ STATUSES[row.status].label }}
          </span>
        </div>
      </template>
    </template>
    <template #body-cell-importance="{ row }">
      <template v-if="row.entityType === 'TASK'">
        {{ IMPORTANCE[row.importance].label }}
      </template>
    </template>

    <template #body-cell-createdAt="{ row }">
      {{ convertDate(row.createdAt) }}
    </template>
    <template #body-cell-startDate="{ row }">
      <template v-if="row.entityType === 'TASK'">
        {{ convertDate(row.startDate) }}
      </template>
    </template>
    <template #body-cell-endDate="{ row }">
      <template v-if="row.entityType === 'TASK'">
        {{ convertDate(row.endDate) }}
      </template>
    </template>
    <template #body-cell-allInheritSharedUsers="{ row }">
      <template v-if="row.entityType === 'FOLDER'">
        <template v-if="row.access === 'PUBLIC'">
          <NTag>Public</NTag>
        </template>
        <template v-else>
          <NTag v-for="user in row.allInheritSharedUsers" :key="user.id" type="success">
            {{ `${user.fullName.firstName[0]}. ${user.fullName.lastName}` }}
          </NTag>
        </template>
      </template>
    </template>
    <template #body-cell-inheritSharedUsers="{ row }">
      <template v-if="row.entityType === 'FOLDER'">
        <NTag v-for="user in row.inheritSharedUsers" :key="user.id" type="success">
          {{ `${user.fullName.firstName[0]}. ${user.fullName.lastName}` }}
        </NTag>
      </template>
    </template>
    <template #body-cell-sharedUsers="{ row }">
      <template v-if="row.entityType === 'FOLDER'">
        <NTag v-for="user in row.sharedUsers" :key="user.id" type="success">
          {{ `${user.fullName.firstName[0]}. ${user.fullName.lastName}` }}
        </NTag>
      </template>
    </template>
    <template #body-cell-executors="{ row }">
      <template v-if="row.entityType === 'TASK'">
        <NTag v-for="user in row.executors" :key="user.id" type="success">
          {{ `${user.fullName.firstName[0]}. ${user.fullName.lastName}` }}
        </NTag>
      </template>
    </template>
    <template #body-cell-author="{ row }">
      <NTag type="success">
        {{ `${row.author.fullName.firstName[0]}. ${row.author.fullName.lastName}` }}
      </NTag>
    </template>
    <template #body-cell-actions="{ index, row, level, isLeaf }">
      <slot :index="index" :row="row" :level="level" :is-leaf="isLeaf" />
    </template>
  </VTable>
  <div v-else>пусто</div>
</template>

<style>
.n-tracker-table-filter {
  width: 280px;
  padding: 0 1rem;
}

.table-task-status {
  display: flex;
  gap: 0.5rem;
}

.table-task-status__color {
  width: 1rem;
  height: 1rem;

  background-color: hsl(var(--task-status-color));
}
</style>
