<script setup>
import { NButton, NForm, NFormItem, NInput, NScrollbar, NSelectV2 } from '@nado/nado-vue-ui'
import { ElCard, ElCol, ElRow } from 'element-plus'
import { v4 as uuid } from 'uuid'
import { computed, inject, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import NFolderOption from '../../../components/NFolderOption/NFolderOption.vue'
import UserSelect from '../../../components/UserSelect/UserSelect.vue'
import VTitle from '../../../components/VTitle/VTitle.vue'
import { useLoading } from '../../../composables/useLoading.js'
import { useNotification } from '../../../composables/useNotification.js'
import { FolderService } from '../../../services/FolderService.js'
import { UserService } from '../../../services/UserService.js'
import { useUserStore } from '../../../store/user.js'
import { LAYOUT_DEFAULT_KEY } from '../../../tokens/layout-default.js'

const layout = inject(LAYOUT_DEFAULT_KEY)

layout.setTitle('Добавить папку')

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
  parent: '',
  sharedUsers: [],
})

const formError = reactive({
  name: '',
  parent: '',
})

const search = ref('')
const folders = ref([])
const users = ref([])

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

    if (formData.sharedUsers.includes(user.id) || user.id === authUser.value.id) {
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
    if (!formData.sharedUsers.includes(user.value.id)) {
      formData.sharedUsers.push(user.value.id)
    }
  })
}

function handleUnselectUser(_users) {
  const ids = new Set(_users.map((el) => el.value.id))

  formData.sharedUsers = formData.sharedUsers.filter((el) => !ids.has(el))
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
    await FolderService.create(formData)
    await getData()

    formData.id = uuid()
    formData.name = ''
    formData.sharedUsers = []

    openNotification({
      title: 'Успех',
      message: 'Папка создана',
      type: 'success',
    })
  } catch (error) {
    if (error.request.data.errors) {
      Object.entries(error.request.data.errors).forEach(([key, errors]) => {
        if (Object.hasOwn(formError, key)) {
          const [firstError] = errors

          formError[key] = firstError
        }
      })
    }

    if (error.request.data.title) {
      openNotification({
        title: 'Error',
        message: error.request.data.title,
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
  parent: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'change' }],
})

async function getData() {
  try {
    await Promise.all([getUsers(), getFolders()])
  } catch (error) {
    if (error.response.data.title) {
      openNotification({
        title: 'Error',
        message: error.response.data.title,
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

  folders.value = response.data.data

  const rootFolder = response.data.data.find((folder) => folder.type === 'ROOT') || null

  if (rootFolder) {
    formData.parent = rootFolder.id
  }
}

async function getDataInit() {
  openLoading()
  await getData()
  closeLoading()
}

getDataInit()
</script>

<template>
  <NScrollbar>
    <div class="create-folder-page">
      <ElCard shadow="never" class="create-folder-page__card">
        <NForm
          ref="formRef"
          class="form form--create-folder"
          :model="formData"
          :rules="rules"
          status-icon
          label-position="top"
        >
          <ElRow :gutter="20">
            <ElCol :span="12">
              <NFormItem label="Название папки" prop="name" :error="formError.name">
                <NInput v-model="formData.name" autocomplete="off" />
              </NFormItem>
            </ElCol>

            <ElCol :span="12">
              <NFormItem label="Родительская папка" prop="parent" :error="formError.parent">
                <NSelectV2
                  v-model="formData.parent"
                  :options="folderOptions"
                  value-key="id"
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

          <ElRow>
            <ElCol class="form-actions">
              <NButton appearance="primary" @click="submitForm(formRef)"> Создать </NButton>
              <NButton plain @click="router.back()"> Назад </NButton>
            </ElCol>
          </ElRow>
        </NForm>
      </ElCard>
    </div>
  </NScrollbar>
</template>

<style>
.create-folder-page {
  padding: 2rem;
}

.create-folder-page__card {
  width: 600px;
}

.form--create-folder .form-actions {
  display: flex;
  gap: 1rem;
  justify-content: space-between;

  margin-top: 2rem;
}
</style>
