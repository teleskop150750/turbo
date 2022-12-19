<script setup>
import { Delete, Plus } from '@element-plus/icons-vue'
import {
  NButton,
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NOption,
  NSelect,
  NSelectV2,
  NTag,
} from '@nado/nado-vue-ui'
import { ElCard, ElCol, ElRow } from 'element-plus'
import { v4 as uuid } from 'uuid'
import { computed, inject, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import VEditor from '../../components/VEditor/VEditor.vue'
import { useLoading } from '../../composables/useLoading.js'
import { useNotification } from '../../composables/useNotification.js'
import { FolderService } from '../../services/FolderService.js'
import { TaskService } from '../../services/TaskService.js'
import { UserService } from '../../services/UserService.js'
import { LAYOUT_DEFAULT_KEY } from '../../tokens/layout-default.js'
import { FOLDER_ACCESS } from '../../tracker/folder.js'
import { IMPORTANCE, RELATIONSHIP_TYPES, STATUSES } from '../../tracker/task.js'

const layout = inject(LAYOUT_DEFAULT_KEY)

layout.setTitle('Добавить задачу')
const { open: openLoading, close: closeLoading } = useLoading()
const { open: openNotification } = useNotification()
const router = useRouter()
const formRef = ref()
const isSending = ref(false)
const formData = reactive({
  taskId: uuid(),
  name: '',
  folder: '',
  importance: IMPORTANCE.NORMAL.value,
  status: STATUSES.NEW.value,
  executors: [],
  dateRange: [],
  startDate: '',
  endDate: '',
  description: '',
  relationships: [],
})

const relationshipForm = reactive({
  task: '',
  type: RELATIONSHIP_TYPES.END_START.value,
})

const formError = reactive({
  name: '',
  folder: '',
  status: '',
  importance: '',
  executors: '',
  dateRange: '',
  description: '',
})

const folders = ref([])
const users = ref([])
const availableTasks = ref([])

const availableTasksOptions = computed(() =>
  availableTasks.value.map((taskTaw) => {
    const selectedTaskIds = formData.relationships.map((relationship) => relationship.task)
    const { id } = taskTaw
    const disabled = selectedTaskIds.includes(id)

    return {
      value: taskTaw,
      label: `${taskTaw.name}`,
      id,
      disabled,
    }
  }),
)

const availableTasksMap = computed(() =>
  availableTasks.value.reduce((previousValue, currentValue) => {
    previousValue[currentValue.id] = currentValue

    return previousValue
  }, {}),
)

const foldersMap = computed(() =>
  folders.value.reduce((object, item) => {
    object[item.id] = item.value

    return object
  }, {}),
)

const currentFolder = computed(() => {
  if (!formData.folder) {
    return null
  }

  if (!foldersMap.value[formData.folder]) {
    return null
  }

  return foldersMap.value[formData.folder]
})

const variantsExecutor = computed(() => {
  if (!currentFolder.value) {
    return []
  }

  if (currentFolder.value.access === FOLDER_ACCESS.PUBLIC) {
    return users.value.map((userRaw) => ({
      value: userRaw,
      label: `${userRaw.fullName.firstName[0]}. ${userRaw.fullName.lastName}`,
    }))
  }

  const sharedUsersRaw = currentFolder.value.allInheritSharedUsers

  return sharedUsersRaw.map((userRaw) => ({
    value: userRaw,
    label: `${userRaw.fullName.firstName[0]}. ${userRaw.fullName.lastName}`,
  }))
})

async function submitForm(formElement) {
  if (isSending.value === true) {
    return
  }

  if (!formElement) {
    return
  }

  isSending.value = true
  openLoading()

  let isValid = true

  await formElement.validate((valid) => {
    if (!valid) {
      isValid = false
    }
  })

  if (!isValid) {
    isSending.value = false
    closeLoading()

    return
  }

  try {
    // eslint-disable-next-line prefer-destructuring
    formData.startDate = formData.dateRange[0]
    // eslint-disable-next-line prefer-destructuring
    formData.endDate = formData.dateRange[1]
    await TaskService.create(formData)
    await getData()

    resetForm(formRef.value)
    openNotification({
      title: 'Успех',
      message: 'Задача создана',
      type: 'success',
    })
  } catch (error) {
    if (error.data.errors) {
      Object.entries(error.data.errors).forEach(([key, errors]) => {
        if (Object.hasOwn(formError, key)) {
          const [firstError] = errors

          formError[key] = firstError
        }
      })
    }

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

function resetForm(formElement) {
  if (!formElement) {
    return
  }

  formElement.resetFields()
  formData.relationships = []
}

const rules = reactive({
  name: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'blur' }],
  folder: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'change' }],
  importance: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'blur' }],
  dateRange: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'blur' }],
  status: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'change' }],
})

function addRelationship() {
  if (!relationshipForm.task) {
    return
  }

  formData.relationships.push({
    taskRelationshipId: uuid(),
    task: relationshipForm.task,
    type: relationshipForm.type,
  })

  relationshipForm.task = ''
}

function deleteRelationship(id) {
  formData.relationships = formData.relationships.filter((relationship) => relationship.taskRelationshipId !== id)
}

async function getData() {
  openLoading()
  await getFolders()
  await Promise.all([getUsers(), getAvailableTasks()])
  closeLoading()
}

async function getUsers() {
  const response = await UserService.getUsers()

  users.value = response.data.data.users
}

async function getFolders() {
  const response = await FolderService.getAvailableFoldersForMe()
  const responseFolders = response.data.data.folders

  folders.value = responseFolders.map((responseFolder) => ({
    value: responseFolder,
    label: `${responseFolder.name}`,
    id: `${responseFolder.id}`,
  }))
}

async function getAvailableTasks() {
  const response = await TaskService.getAvailableTasks()

  availableTasks.value = response.data.data.tasks
}

getData()
</script>

<template>
  <div class="create-task-page">
    <ElCard shadow="never" class="create-task-page__card">
      <NForm
        ref="formRef"
        class="form form--create-task"
        :model="formData"
        :rules="rules"
        status-icon
        label-position="top"
      >
        <ElRow :gutter="20">
          <ElCol :span="10">
            <ElRow :gutter="20">
              <ElCol :span="24">
                <NFormItem label="Название задачи" prop="name" :error="formError.name">
                  <NInput v-model="formData.name" autocomplete="off" />
                </NFormItem>
              </ElCol>
            </ElRow>
            <ElRow :gutter="20">
              <ElCol :span="24">
                <NFormItem label="Родительская папка" prop="folder" :error="formError.folder">
                  <NSelectV2
                    v-model="formData.folder"
                    :options="folders"
                    value-key="id"
                    clearable
                    filterable
                    :item-height="52"
                    style="width: 100%"
                    placeholder="Выберите"
                  >
                    <template #default="{ item }">
                      <div class="tacker-option">
                        <span class="tacker-option__name">{{ item.label }}</span>
                        <div class="tacker-option__path">
                          <NTag
                            v-for="(pathItem, index) in item.value.path"
                            :key="index"
                            class="tacker-option__path-item"
                            disable-transitions
                            type="warning"
                            size="small"
                          >
                            {{ pathItem }}
                          </NTag>
                        </div>
                      </div>
                    </template>
                  </NSelectV2>
                </NFormItem>
              </ElCol>
            </ElRow>

            <ElRow :gutter="20">
              <ElCol :span="24">
                <NFormItem label="Исполнители" prop="executors" :error="formError.executors">
                  <NSelectV2
                    v-model="formData.executors"
                    value-key="value.id"
                    clearable
                    multiple
                    filterable
                    :options="variantsExecutor"
                    style="width: 100%"
                    placeholder="Выберите"
                  />
                </NFormItem>
              </ElCol>
            </ElRow>

            <ElRow :gutter="20">
              <ElCol :span="12">
                <NFormItem label="Важность" prop="importance" :error="formError.importance">
                  <NSelect v-model="formData.importance" clearable style="width: 100%" placeholder="Выберите">
                    <NOption
                      v-for="item in Object.values(IMPORTANCE)"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </NSelect>
                </NFormItem>
              </ElCol>
              <ElCol :span="12">
                <NFormItem label="Статус" prop="status" :error="formError.status">
                  <NSelect v-model="formData.status" clearable style="width: 100%" placeholder="Выберите" disabled>
                    <NOption
                      v-for="item in Object.values(STATUSES)"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                      <div class="status-option">
                        <span class="status-option__color" :style="{ '--status-color': item.color }" />
                        <span class="status-option__label">
                          {{ item.label }}
                        </span>
                      </div>
                    </NOption>

                    <!-- <template #prefix>
                      <span class="status-color" :style="{ '--status-color': STATUSES[formData.status].color }" />
                    </template> -->
                  </NSelect>
                </NFormItem>
              </ElCol>
            </ElRow>

            <ElRow :gutter="20">
              <ElCol :span="24">
                <NFormItem label="Дата выполнения" prop="dateRange" :error="formError.dateRange">
                  <NDatePicker
                    v-model="formData.dateRange"
                    type="daterange"
                    range-separator="До"
                    value-format="YYYY-MM-DD"
                    start-placeholder="Дата начала"
                    end-placeholder="Дата конца"
                  />
                </NFormItem>
              </ElCol>
            </ElRow>

            <div class="task-relations">
              <div class="task-relations__new-relation-wrapper">
                <p class="n-title-2 task-relations__new-relation-wrapper-title">Добавить связь</p>
                <div class="task-relations__new-relation">
                  <div class="el-col el-col-11">
                    <NFormItem label="Связанная задача" :show-message="false">
                      <NSelectV2
                        v-model="relationshipForm.task"
                        :options="availableTasksOptions"
                        value-key="id"
                        filterable
                        :item-height="52"
                        style="width: 100%"
                        placeholder="Выберите"
                      >
                        <template #default="{ item }">
                          <div class="tacker-option">
                            <span class="tacker-option__name">{{ item.label }}</span>
                            <div class="tacker-option__path">
                              <NTag
                                v-for="(pathItem, index) in item.value.path"
                                :key="index"
                                class="tacker-option__path-item"
                                disable-transitions
                                type="warning"
                                size="small"
                              >
                                {{ pathItem }}
                              </NTag>
                            </div>
                          </div>
                        </template>
                      </NSelectV2>
                    </NFormItem>
                  </div>
                  <div class="el-col el-col-11">
                    <NFormItem label="Тип связи">
                      <NSelect v-model="relationshipForm.type" style="width: 100%" placeholder="Выберите">
                        <NOption
                          v-for="item in Object.values(RELATIONSHIP_TYPES)"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                      </NSelect>
                    </NFormItem>
                  </div>
                  <div class="task-relations__new-relation-button-wrapper">
                    <NButton appearance="primary" :icon="Plus" circle @click="addRelationship" />
                  </div>
                </div>
              </div>
              <div v-if="formData.relationships.length > 0" class="task-relations__list-wrapper">
                <p class="task-relations__list-title n-title-3">Список связей</p>
                <div class="task-relations__list">
                  <div
                    v-for="relationship in formData.relationships"
                    :key="relationship.taskRelationshipId"
                    class="task-relations__list-item"
                  >
                    <template v-if="availableTasksMap[relationship.task]">
                      <div class="el-col el-col-11">
                        <NFormItem label="Задача">
                          <NInput :model-value="availableTasksMap[relationship.task].name" readonly />
                        </NFormItem>
                      </div>
                      <div class="el-col el-col-11">
                        <NFormItem label="Тип связи">
                          <NInput :model-value="RELATIONSHIP_TYPES[relationship.type].label" readonly />
                        </NFormItem>
                      </div>
                      <div class="task-relations__list-item-button-wrapper">
                        <NButton
                          type="danger"
                          :icon="Delete"
                          circle
                          @click="deleteRelationship(relationship.deleteRelationship)"
                        />
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <ElRow>
              <ElCol class="form-actions">
                <NButton appearance="primary" @click="submitForm(formRef)"> Создать </NButton>
                <NButton @click="resetForm(formRef)"> Сбросить </NButton>
                <NButton plain appearance="primary" @click="router.back()"> Назад </NButton>
              </ElCol>
            </ElRow>
          </ElCol>
          <ElCol :span="14">
            <VEditor v-model="formData.description" />
          </ElCol>
        </ElRow>
      </NForm>
    </ElCard>
  </div>
</template>

<style>
.create-task-page__card {
  width: 100%;
  padding: 2rem;
}

.form--create-task .form-actions {
  display: flex;
  gap: 1rem;

  margin-top: 1rem;
}

.form--create-task .form-actions > * {
  margin: 0 !important;
}

.form--create-task .form-actions > *:last-child {
  margin-left: auto !important;
}
</style>
