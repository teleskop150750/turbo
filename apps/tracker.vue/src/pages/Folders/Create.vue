<script setup>
import { NButton, NForm, NFormItem, NInput, NRadio, NSelectV2, NTag } from '@nado/nado-vue-ui'
import { ElCard, ElCol, ElRow } from 'element-plus'
import { v4 as uuid } from 'uuid'
import { computed, inject, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useLoading } from '../../composables/useLoading.js'
import { useNotification } from '../../composables/useNotification.js'
import { FolderService } from '../../services/FolderService.js'
import { UserService } from '../../services/UserService.js'
import { useUserStore } from '../../store/user.js'
import { LAYOUT_DEFAULT_KEY } from '../../tokens/layout-default.js'
import { FOLDER_ACCESS } from '../../tracker/folder.js'

const layout = inject(LAYOUT_DEFAULT_KEY)

layout.setTitle('Добавить папку')
const { open: openLoading, close: closeLoading } = useLoading()
const { open: openNotification } = useNotification()
const router = useRouter()
const userStore = useUserStore()
const currentUser = userStore.getUser()
const formRef = ref()
const isSending = ref(false)

const formData = reactive({
  folderId: uuid(),
  name: '',
  parent: '',
  access: 'PRIVATE',
  sharedUsers: [],
})

const formError = reactive({
  name: '',
  parent: '',
  access: '',
  sharedUsers: '',
})

const folderOptions = ref([])

const responseUsers = ref([])

const currentParent = computed(() => {
  if (formData.parent === '') {
    return null
  }

  return folderOptions.value.find((item) => item.value.id === formData.parent).value
})

const userOptions = computed(() =>
  responseUsers.value.map((responseUser) => {
    let disabled = false

    disabled = !currentParent.value
      ? responseUser.id === currentUser.value.id
      : currentParent.value.allInheritSharedUsers.findIndex((user) => user.id === responseUser.id) >= 0

    return {
      value: responseUser,
      label: `${responseUser.fullName.firstName[0]}. ${responseUser.fullName.lastName}`,
      disabled,
    }
  }),
)

const isCanSelectPrivate = computed(() => {
  if (!currentParent.value) {
    return true
  }

  if (currentParent.value.access === FOLDER_ACCESS.LIMIT) {
    return false
  }

  return true
})

const isCanSelectSharedUsers = computed(() => {
  if (!currentParent.value) {
    return formData.access === FOLDER_ACCESS.LIMIT
  }

  return !!(
    [FOLDER_ACCESS.LIMIT, FOLDER_ACCESS.PRIVATE].includes(currentParent.value.access) &&
    formData.access === FOLDER_ACCESS.LIMIT
  )
})

const isShowFolderAccessSelect = computed(() => {
  if (!currentParent.value) {
    return true
  }

  return currentParent.value.access !== FOLDER_ACCESS.PUBLIC
})

watch(
  () => formData.parent,
  (value) => {
    if (value) {
      formData.access = currentParent.value.access
    }
  },
)

watch(
  () => formData.access,
  () => {
    formData.sharedUsers = []
  },
)

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

    resetForm(formRef.value)
    formData.folderId = uuid()

    openNotification({
      title: 'Успех',
      message: 'Папка создана',
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
}

const rules = reactive({
  name: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'blur' }],
  parent: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'change' }],
  access: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'blur' }],
})

async function getData() {
  try {
    await getFolders()
    await Promise.all([getUsers()])
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

async function getUsers() {
  const response = await UserService.getUsers()

  responseUsers.value = response.data.data.users
}

async function getFolders() {
  const response = await FolderService.getAvailableFoldersForMe()
  const responseFolders = response.data.data.folders

  folderOptions.value = responseFolders.map((responseFolder) => ({
    id: responseFolder.id,
    value: responseFolder,
    label: `${responseFolder.name}`,
  }))
}

async function getDataInit() {
  openLoading()
  await getData()
  closeLoading()
}

getDataInit()
</script>

<template>
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
                  <div class="tacker-option">
                    <span class="tacker-option__name">{{ item.label }}</span>
                    <div class="tacker-option__path">
                      <span
                        v-for="(pathItem, index) in item.value.path"
                        :key="index"
                        class="tacker-option__path-item"
                        disable-transitions
                        type="warning"
                        size="small"
                      >
                        {{ pathItem }}
                      </span>
                    </div>
                  </div>
                </template>
              </NSelectV2>
            </NFormItem>
          </ElCol>
        </ElRow>
        <ElRow v-if="isShowFolderAccessSelect" :gutter="20">
          <ElCol :span="24">
            <NFormItem label="Доступ" prop="access" :error="formError.access">
              <div class="n-radio-group">
                <NRadio v-if="isCanSelectPrivate" v-model="formData.access" val="PRIVATE"> Приватный </NRadio>
                <NRadio v-model="formData.access" val="LIMIT"> Ограниченное число пользователей </NRadio>
                <NRadio v-model="formData.access" val="PUBLIC"> Доступно всем </NRadio>
              </div>
            </NFormItem>
          </ElCol>
        </ElRow>

        <ElRow v-if="isCanSelectSharedUsers" :gutter="20">
          <ElCol :span="24">
            <NFormItem label="Список участников" prop="sharedUsers" :error="formError.sharedUsers">
              <NSelectV2
                v-model="formData.sharedUsers"
                value-key="value.id"
                clearable
                multiple
                filterable
                :options="userOptions"
                style="width: 100%"
                placeholder="Выберите"
              >
                <template #default="{ item }">
                  <span>{{ item.label }}</span>
                </template>
              </NSelectV2>
            </NFormItem>
          </ElCol>
        </ElRow>

        <ElRow>
          <ElCol class="form-actions">
            <NButton appearance="primary" @click="submitForm(formRef)"> Создать </NButton>
            <NButton @click="resetForm(formRef)"> Сбросить </NButton>
            <NButton plain @click="router.back()"> Назад </NButton>
          </ElCol>
        </ElRow>
      </NForm>
    </ElCard>
  </div>
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

  margin-top: 1rem;
}

.form--create-folder .form-actions > * {
  margin: 0 !important;
}

.form--create-folder .form-actions > *:last-child {
  margin-left: auto !important;
}

.folder-access-radio-group {
  display: flex;

  width: 100%;
}

.folder-access-radio-group .el-radio-button {
  display: grid;
  flex-grow: 1;
}
</style>
