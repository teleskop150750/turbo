<script setup>
import {
  NButton,
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NOption,
  NScrollbar,
  NSelect,
  NSelectV2,
  NUpload,
} from '@nado/nado-vue-ui'
import { ElCard, ElCol, ElRow } from 'element-plus'
import { computed, inject, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import NFolderOption from '../../../components/NFolderOption/NFolderOption.vue'
import UserSelect from '../../../components/UserSelect/UserSelect.vue'
import VEditor from '../../../components/VEditor/VEditor.vue'
import VTitle from '../../../components/VTitle/VTitle.vue'
import { useLoading } from '../../../composables/useLoading.js'
import { useNotification } from '../../../composables/useNotification.js'
import { FolderService } from '../../../services/FolderService.js'
import { TaskService } from '../../../services/TaskService.js'
import { UserService } from '../../../services/UserService.js'
import { useUserStore } from '../../../store/user.js'
import { LAYOUT_DEFAULT_KEY } from '../../../tokens/layout-default.js'
import { IMPORTANCE, STATUSES } from '../../../tracker/task.js'
import NTaskRelations from '../components/NTaskRelations/NTaskRelations.vue'

const layout = inject(LAYOUT_DEFAULT_KEY)

layout.setTitle('Редактировать задачу')
const { open: openLoading, close: closeLoading } = useLoading()
const { open: openNotification } = useNotification()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const authUser = userStore.getUser()
const formRef = ref()
const isSending = ref(false)

const formData = reactive({
  id: '',
  name: '',
  folders: [],
  importance: '',
  status: '',
  executors: [],
  dateRange: [],
  description: '',
  depends: [],
  affects: [],
})

const formError = reactive({
  name: '',
  folders: '',
  status: '',
  importance: '',
  executors: '',
  dateRange: '',
  description: '',
})
const fileList = ref([])

const search = ref('')
const users = ref([])
const folders = ref([])
const tasks = ref([])
const wasStarted = ref(false)
const rights = ref({})

const dateRange = reactive({
  minDate: undefined,
  maxDate: undefined,
})

const folderOptions = computed(() =>
  folders.value.map((folder) => ({
    id: folder.id,
    value: folder,
    label: `${folder.name}`,
  })),
)

const userOptions = computed(() =>
  users.value.map((user) => {
    let selected = false

    if (formData.executors.includes(user.id) || user.id === authUser.value.id) {
      selected = true
    }

    const disabled = user.id === authUser.value.id

    return {
      value: user,
      label: `${user.fullName.firstName[0]}. ${user.fullName.lastName}`,
      disabled,
      selected,
    }
  }),
)

function handleSelectUser(_users) {
  _users.forEach((user) => {
    if (!formData.executors.includes(user.value.id)) {
      formData.executors.push(user.value.id)
    }
  })
}

function handleUnselectUser(_users) {
  const ids = new Set(_users.map((el) => el.value.id))

  formData.executors = formData.executors.filter((el) => !ids.has(el))
}

const statusOptions = computed(() => {
  const statuses = Object.values(STATUSES)

  return statuses.map((status) => {
    status.disabled = false

    // @ts-ignore
    if (status.value === STATUSES.IN_WORK.value && rights.value.CAN_BEGIN_TASK !== undefined) {
      // @ts-ignore
      status.disabled = !rights.value.CAN_BEGIN_TASK
    }

    return status
  })
})

async function submitForm() {
  if (isSending.value === true) {
    return
  }

  if (!formRef.value) {
    return
  }

  isSending.value = true
  openLoading()

  let isValid = true

  await formRef.value.validate((valid) => {
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

    const payload = { ...formData, startDate: formData.dateRange[0], endDate: formData.dateRange[1] }

    delete payload.dateRange

    await TaskService.update(formData.id, payload)
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
  folders: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'change' }],
  importance: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'blur' }],
  dateRange: [{ required: true, validator: validateDateRange, trigger: 'blur' }],
  status: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'change' }],
})

function validateDateRange(_, value, callback) {
  if (value.length < 2) {
    callback(new Error('Дата выполнения не указана'))
  }

  const startDate = new Date(value[0])
  const endDate = new Date(value[1])

  if (!(startDate < endDate)) {
    callback(new Error('Дата начала должна быть раньше'))
  }

  if (dateRange.minDate && startDate.getTime() < dateRange.minDate.getTime()) {
    callback(new Error('Невалидная дата начала'))
  }

  if (dateRange.maxDate && endDate.getTime() > dateRange.maxDate.getTime()) {
    callback(new Error('Невалидная дата конца'))
  }

  callback()
}

async function getData() {
  try {
    await Promise.all([getTask(), getFolders(), getUsers(), getTasks()])
  } catch (error) {
    if (error.data && error.data.title) {
      openNotification({
        title: 'Error',
        message: error.data.title,
        type: 'error',
      })
    }
  }
}

async function getUsers() {
  const response = await UserService.getUsers()

  users.value = response.data.data
}

async function getFolders() {
  const response = await FolderService.getFolders()
  const responseFolders = response.data.data

  folders.value = responseFolders

  const rootFolder = response.data.data.find((folder) => folder.type === 'ROOT') || null

  if (rootFolder) {
    formData.folders.push(rootFolder.id)
  }
}

async function getTask() {
  const response = await TaskService.show(route.params.id)
  const task = response.data.data

  // fileList.value = responseTask.files.map((item) => ({
  //   id: item.id,
  //   name: item.originName,
  // }))

  formData.id = task.id
  formData.name = task.name
  formData.importance = task.importance
  formData.status = task.status
  formData.dateRange = [task.startDate, task.endDate]
  formData.description = task.description
  formData.executors = task.executors.map((user) => user.id)
  formData.folders = task.folders.map((folder) => folder.id)
  formData.depends = task.inverseTaskRelationships.map((rel) => rel.left.id)
  formData.affects = task.taskRelationships.map((rel) => rel.right.id)
}

async function getTasks() {
  const response = await TaskService.getTasks()

  tasks.value = response.data.data
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

const disabledDate = (time) => {
  if (dateRange.minDate && dateRange.maxDate) {
    return time.getTime() < dateRange.minDate.getTime() || time.getTime() > dateRange.maxDate.getTime()
  }

  if (dateRange.minDate) {
    return time.getTime() < dateRange.minDate.getTime()
  }

  if (dateRange.maxDate) {
    return time.getTime() > dateRange.maxDate.getTime()
  }

  return false
}

function handleDepends(val) {
  formData.depends = val
  // updateRelations()
}

function handleAffects(val) {
  formData.affects = val
  // updateRelations()
}

async function getRelations() {
  const response = await TaskService.show(route.params.id)
  const task = response.data.data

  formData.status = task.status
  formData.depends = task.inverseTaskRelationships.map((rel) => rel.left.id)
  formData.affects = task.taskRelationships.map((rel) => rel.right.id)
}
</script>

<template>
  <NScrollbar>
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
                  <NFormItem label="Папки" prop="folders" :error="formError.folders">
                    <NSelectV2
                      v-model="formData.folders"
                      :options="folderOptions"
                      value-key="id"
                      multiple
                      filterable
                      :item-height="52"
                      style="width: 100%"
                      placeholder="Выберите"
                    >
                      <template #default="{ item }">
                        <NFolderOption :folder="item" />
                      </template>
                    </NSelectV2>
                  </NFormItem>
                </ElCol>
              </ElRow>

              <ElRow :gutter="20">
                <ElCol :span="24">
                  <VTitle class="form__subtitle" level="3">Участники</VTitle>
                </ElCol>
              </ElRow>

              <ElRow :gutter="20">
                <ElCol :span="24">
                  <UserSelect
                    v-model:search="search"
                    :users="userOptions"
                    @select="handleSelectUser"
                    @unselect="handleUnselectUser"
                  />
                </ElCol>
              </ElRow>

              <ElRow :gutter="20">
                <ElCol :span="12">
                  <NFormItem label="Важность" prop="importance" :error="formError.importance">
                    <NSelect v-model="formData.importance" style="width: 100%" placeholder="Выберите">
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
                    <NSelect v-model="formData.status" style="width: 100%" placeholder="Выберите">
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
                    </NSelect>
                  </NFormItem>
                </ElCol>
              </ElRow>

              <ElRow :gutter="20">
                <ElCol :span="24">
                  <VTitle class="form__subtitle" level="3">Связанные задачи</VTitle>
                </ElCol>
              </ElRow>

              <ElRow :gutter="20">
                <ElCol :span="24">
                  <NTaskRelations
                    v-model:minDate="dateRange.minDate"
                    v-model:maxDate="dateRange.maxDate"
                    :depends="formData.depends"
                    :affects="formData.affects"
                    class="form__relations"
                    :tasks="tasks"
                    @update:depends="handleDepends"
                    @update:affects="handleAffects"
                  />
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
                      :disabled-date="disabledDate"
                    />
                  </NFormItem>
                </ElCol>
              </ElRow>

              <ElRow>
                <ElCol class="form-actions">
                  <NButton appearance="primary" @click="submitForm(formRef)"> Редактировать </NButton>
                  <!-- <NButton @click="resetForm(formRef)">Сбросить</NButton> -->
                  <NButton plain @click="router.back()"> Назад </NButton>
                </ElCol>
              </ElRow>
            </ElCol>
            <ElCol :span="14">
              <ElRow :gutter="24">
                <ElCol :span="24">
                  <NFormItem label="Описание" hide-hint>
                    <VEditor v-model="formData.description" />
                  </NFormItem>
                </ElCol>
              </ElRow>
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
  </NScrollbar>
</template>

<style>
.update-task-page {
  padding: 2rem;
}

.update-task-page__card {
  width: 100%;
}

.form--update-task .form__subtitle {
  margin: 0;
  margin-bottom: 1rem;
}

.form--update-task .form__relations {
  margin-bottom: 2rem;
}

.form--update-task .form-actions {
  display: flex;
  gap: 1rem;
}
</style>
