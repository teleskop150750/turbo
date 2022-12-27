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
} from '@nado/nado-vue-ui'
import { ElCard, ElCol, ElRow } from 'element-plus'
import { v4 as uuid } from 'uuid'
import { computed, inject, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

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

layout.setTitle('Добавить задачу')
const { open: openLoading, close: closeLoading } = useLoading()
const { open: openNotification } = useNotification()
const router = useRouter()
const userStore = useUserStore()
const authUser = userStore.getUser()
const formRef = ref()
const isSending = ref(false)

const formData = reactive({
  id: uuid(),
  name: '',
  folders: [],
  importance: IMPORTANCE.NORMAL.value,
  status: STATUSES.NEW.value,
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

const search = ref('')
const folders = ref([])
const users = ref([])
const tasks = ref([])

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
    const payload = {
      ...formData,
      startDate: formData.dateRange[0],
      endDate: formData.dateRange[1],
    }

    delete payload.dateRange

    await TaskService.create(payload)
    await getDataInit()

    resetForm(formRef.value)
    formData.id = uuid()
    formData.description = ''
    formData.executors = []
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
  formData.affects = []
  formData.depends = []
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

async function getDataInit() {
  openLoading()
  try {
    await Promise.all([getFolders(), getUsers(), getTasks()])
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

async function getTasks() {
  const response = await TaskService.getTasks()

  tasks.value = response.data.data
}

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
</script>

<template>
  <NScrollbar>
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
                    <NSelect v-model="formData.status" style="width: 100%" placeholder="Выберите" disabled>
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
                    v-model:depends="formData.depends"
                    v-model:affects="formData.affects"
                    v-model:minDate="dateRange.minDate"
                    v-model:maxDate="dateRange.maxDate"
                    class="form__relations"
                    :tasks="tasks"
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
                      unlink-panels
                      value-format="YYYY-MM-DDTHH:mm:ss"
                      format="DD-MM-YYYY"
                      start-placeholder="Дата начала"
                      end-placeholder="Дата конца"
                      :disabled-date="disabledDate"
                    />
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

              <ElRow>
                <ElCol class="form-actions">
                  <NButton appearance="primary" @click="submitForm(formRef)"> Создать </NButton>
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
            </ElCol>
          </ElRow>
        </NForm>
      </ElCard>
    </div>
  </NScrollbar>
</template>

<style>
.create-task-page {
  padding: 2rem;
}

.create-task-page__card {
  width: 100%;
}

.form--create-task .form__subtitle {
  margin: 0;
  margin-bottom: 1rem;
}

.form--create-task .form__relations {
  margin-bottom: 2rem;
}

.form--create-task .form-actions {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}
</style>
