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
  NUpload,
} from '@nado/nado-vue-ui'
import { ElCard, ElCol, ElRow } from 'element-plus'
import { v4 as uuid } from 'uuid'
import { computed, inject, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

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

layout.setTitle('Редактировать задачу')
const { open: openLoading, close: closeLoading } = useLoading()
const { open: openNotification } = useNotification()
const route = useRoute()
const router = useRouter()
const formRef = ref()
const isSending = ref(false)

const formData = reactive({
  id: '',
  name: '',
  folder: '',
  importance: '',
  status: '',
  executors: [],
  dateRange: [],
  description: '',
  relationships: [],
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
const fileList = ref([])

const relationshipForm = reactive({
  task: '',
  type: RELATIONSHIP_TYPES.END_START.value,
})

const wasStarted = ref(false)
const rights = ref({})
const folders = ref([])
const responseUsers = ref([])
const availableTasks = ref([])

const statusOptions = computed(() => {
  const statuses = Object.values(STATUSES)

  return statuses.map((status) => {
    status.disabled = false

    // @ts-ignore
    if (status.value === STATUSES.IN_WORK.value && rights.value.CAN_BEGIN_TASK !== undefined) {
      // @ts-ignore
      status.disabled = !rights.value.CAN_BEGIN_TASK
    }

    // @ts-ignore
    if (status.value === STATUSES.DONE.value && rights.value.CAN_END_TASK !== undefined) {
      // @ts-ignore
      status.disabled = !rights.value.CAN_END_TASK
    }

    return status
  })
})

const availableTasksOptions = computed(() => {
  const options = availableTasks.value.map((taskTaw) => {
    const selectedTaskIds = formData.relationships.map((relationship) => relationship.task)
    const { id } = taskTaw
    const disabled = selectedTaskIds.includes(id)

    return {
      value: taskTaw,
      label: `${taskTaw.name}`,
      id,
      disabled,
    }
  })

  return options.filter((item) => item.id !== formData.id)
})

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
    return responseUsers.value.map((responseUser) => ({
      value: responseUser,
      label: `${responseUser.fullName.firstName[0]}. ${responseUser.fullName.lastName}`,
    }))
  }

  const sharedUsers = currentFolder.value.allInheritSharedUsers

  return sharedUsers.map((sharedUser) => ({
    value: sharedUser,
    label: `${sharedUser.fullName.firstName[0]}. ${sharedUser.fullName.lastName}`,
  }))
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
    if (formData.status === STATUSES.IN_WORK.value) {
      wasStarted.value = true
    }

    await TaskService.update(formData)
    await getData()
    openNotification({
      title: 'Успех',
      message: 'Задача обновлена',
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

const rules = reactive({
  name: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'blur' }],
  folder: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'change' }],
  importance: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'blur' }],
  dateRange: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'blur' }],
  status: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'change' }],
})

async function getData() {
  try {
    await Promise.all([getTask(), getFolders(), getUsers(), getAvailableTasks()])
  } catch (error) {
    if (error.data && error.data.message) {
      openNotification({
        title: 'Error',
        message: error.data.message,
        type: 'error',
      })
    }
  }
}

async function getUsers() {
  const response = await UserService.getUsers()

  responseUsers.value = response.data.data.users
}

async function getFolders() {
  const response = await FolderService.getAvailableFoldersForMe()
  const rawFolders = response.data.data.folders

  folders.value = rawFolders.map((rawFolder) => ({
    value: rawFolder,
    label: `${rawFolder.name}`,
    id: `${rawFolder.id}`,
  }))
}

async function getTask() {
  const response = await TaskService.getTask(route.params.id)
  const responseTask = response.data.data.task

  fileList.value = responseTask.files.map((item) => ({
    id: item.id,
    name: item.originName,
  }))

  rights.value = response.data.data.rights
  formData.id = responseTask.id
  formData.name = responseTask.name
  formData.importance = responseTask.importance
  formData.status = responseTask.status
  formData.dateRange = [responseTask.startDate, responseTask.endDate]
  // initStartDate = responseTask.startDate
  // initEndDate = responseTask.endDate
  formData.description = responseTask.description
  formData.executors = responseTask.executors.map((user) => user.id)
  formData.folder = responseTask.folderId
  wasStarted.value = responseTask.wasStarted
  formData.relationships = responseTask.relationships.map((relationship) => ({
    taskRelationshipId: relationship.id,
    task: relationship.task.id,
    type: relationship.type,
  }))
}

async function getAvailableTasks() {
  const response = await TaskService.getAvailableTasks()

  availableTasks.value = response.data.data.tasks
}

async function getDataInit() {
  openLoading()
  await getData()
  closeLoading()
}

const handleRemove = (file, uploadFiles) => {
  console.log(file, uploadFiles)
}

async function handlePreview(uploadFile) {
  try {
    const response = await TaskService.downloadFile(uploadFile.id)
    const fileUrl = window.URL.createObjectURL(new Blob([response.data]))
    const docUrl = document.createElement('a')

    docUrl.href = fileUrl
    docUrl.setAttribute('download', uploadFile.name)
    document.body.append(docUrl)
    docUrl.click()
    docUrl.remove()
  } catch (error) {
    console.log(error)
  }
}

async function beforeRemove(uploadFile) {
  try {
    const id = uploadFile.response ? uploadFile.response.data.id : uploadFile.id

    await TaskService.removeFile(id)

    return true
  } catch {
    return false
  }
}

const uploadUrl = computed(() => `${import.meta.env.VITE_APP_API_URL}/api/v1/tasks/${formData.id}/add-file`)

getDataInit()
</script>

<template>
  <div class="update-task-page">
    <ElCard shadow="never" class="update-task-page__card">
      <NForm
        ref="formRef"
        class="form form--update-task"
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
                    value-key="id"
                    clearable
                    filterable
                    :options="folders"
                    style="width: 100%"
                    placeholder="Выберите"
                  />
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
                  <NSelect v-model="formData.status" clearable style="width: 100%" placeholder="Выберите">
                    <NOption
                      v-for="item in statusOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                      :disabled="item.disabled"
                    >
                      <div class="status-option">
                        <span class="status-option__color" :style="{ '--status-color': item.color }" />
                        <span class="status-option__label">
                          {{ item.label }}
                        </span>
                      </div>
                    </NOption>

                    <!-- <template v-if="formData.status" #prefix>
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
                <p class="task-relations__new-relation-title">Добавить связь</p>
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
                  <div class="task-relations__new-relation-button-wrapper el-col el-col-2">
                    <NButton appearance="primary" :icon="Plus" circle @click="addRelationship" />
                  </div>
                </div>
              </div>

              <div v-if="formData.relationships.length > 0" class="task-relations__list-wrapper">
                <p class="task-relations__list-title">Список связей</p>
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
                      <div class="task-relations__list-item-button-wrapper el-col el-col-2">
                        <NButton
                          appearance="error"
                          :icon="Delete"
                          circle
                          @click="deleteRelationship(relationship.taskRelationshipId)"
                        />
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <ElRow>
              <ElCol class="form-actions">
                <NButton appearance="primary" @click="submitForm(formRef)"> Редактировать </NButton>
                <!-- <NButton @click="resetForm(formRef)">Сбросить</NButton> -->
                <NButton plain @click="router.back()"> Назад </NButton>
              </ElCol>
            </ElRow>
          </ElCol>
          <ElCol :span="14">
            <div class="update-task-page__editor">
              <VEditor v-model="formData.description" />
            </div>
            <div class="update-task-page__upload">
              <NUpload
                v-model:file-list="fileList"
                :action="uploadUrl"
                multiple
                name="file"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :before-remove="beforeRemove"
              >
                <NButton appearance="primary">Добавить файл</NButton>
              </NUpload>
            </div>
          </ElCol>
        </ElRow>
      </NForm>
    </ElCard>
  </div>
</template>

<style>
.update-task-page__card {
  width: 100%;
}

.form--update-task .form-actions {
  display: flex;
  gap: 1rem;

  margin-top: 1rem;
}

.form--update-task .form-actions > * {
  margin: 0 !important;
}

.form--update-task .form-actions > *:last-child {
  margin-left: auto !important;
}
</style>
