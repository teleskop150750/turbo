<script setup>
import { dayjs, NAvatar, NInput } from '@nado/nado-vue-ui'
import { useResizeObserver } from '@vueuse/core'
import { ElButton, ElConfigProvider, ElTable, ElTableColumn } from 'element-plus'
import ru from 'element-plus/dist/locale/ru.mjs'
import { computed, ref } from 'vue'

import NTableUsersCell from '../NTableUsersCell/NTableUsersCell.vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
})

const search = ref('')

const handleEdit = (index, row) => {
  console.log(index, row)
}
const handleDelete = (index, row) => {
  console.log(index, row)
}

const filterTableData = computed(() =>
  props.data.filter((data) => !search.value || data.name.toLowerCase().includes(search.value.toLowerCase())),
)

const users = computed(() => {
  let list = []

  filterTableData.value.forEach((el) => {
    list = [...list, ...el.sharedUsers]
  })

  const map = Object.fromEntries(list.map((next) => [next.id, next]))

  return Object.values(map).map((user) => ({
    value: user.id,
    text: `${user.fullName.firstName[0]}. ${user.fullName.lastName}`,
  }))
})

const filterUsers = (value, row) => {
  const _users = row.sharedUsers

  return Boolean(_users.find((el) => el.id === value))
}

const el = ref()
const height = ref(0)

useResizeObserver(el, (entries) => {
  const entry = entries[0]

  height.value = entry.contentRect.height
})
</script>

<template>
  <ElConfigProvider :locale="ru">
    <div ref="el" class="n-folders-table-wrapper">
      <ElTable class="n-folders-table" :height="height" :data="filterTableData" style="width: 100%">
        <ElTableColumn label="Название" prop="name" />
        <ElTableColumn label="Автор" prop="author">
          <template #default="scope">
            <NAvatar
              :size="26"
              :user-name="`${scope.row.author.fullName.firstName[0]}. ${scope.row.author.fullName.lastName}`"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="Участники" prop="sharedUsers" :filters="users" :filter-method="filterUsers">
          <template #default="scope">
            <NTableUsersCell :users="scope.row.sharedUsers" />
          </template>
        </ElTableColumn>
        <ElTableColumn label="Дата создания" sortable prop="createdAt">
          <template #default="scope">
            {{ dayjs(scope.row.createdAt).format('DD.MM.YYYY') }}
          </template>
        </ElTableColumn>
        <ElTableColumn align="right">
          <template #header>
            <div class="n-folders-table__search">
              <NInput v-model="search" size="small" placeholder="Поиск" />
            </div>
          </template>
          <template #default="scope">
            <ElButton size="small" @click="handleEdit(scope.$index, scope.row)">Edit</ElButton>
            <ElButton size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">Delete</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </ElConfigProvider>
</template>

<style>
.n-folders-table-wrapper {
  height: 100%;
}

.n-folders-table.el-table th.el-table__cell > .cell.highlight {
  color: var(--n-sys-color-primary-800);
}

.n-folders-table.el-table thead {
  color: var(--n-sys-color-primary);
  font-weight: 500;
}

.n-folders-table__search {
  padding: 4px;
}
</style>
