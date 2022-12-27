<script setup>
import { NButton, NForm, NFormItem, NInput, NScrollbar } from '@nado/nado-vue-ui'
import { ElCard, ElCol, ElRow } from 'element-plus'
import { computed, inject, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import UserSelect from '../../../components/UserSelect/UserSelect.vue'
import VTitle from '../../../components/VTitle/VTitle.vue'
import { useLoading } from '../../../composables/useLoading.js'
import { useNotification } from '../../../composables/useNotification.js'
import { FolderService } from '../../../services/FolderService.js'
import { UserService } from '../../../services/UserService.js'
import { LAYOUT_DEFAULT_KEY } from '../../../tokens/layout-default.js'

const layout = inject(LAYOUT_DEFAULT_KEY)

layout.setTitle('Редактировать папку')
const { open: openLoading, close: closeLoading } = useLoading()
const { open: openNotification } = useNotification()
const route = useRoute()
const router = useRouter()
const formRef = ref()
const isSending = ref(false)

const id = ref()
const formData = reactive({
  name: '',
  sharedUsers: [],
})

const formError = reactive({
  name: '',
})

const search = ref('')
const users = ref([])
const folder = ref()

const userOptions = computed(() => {
  if (!folder.value) {
    return []
  }

  const folderAuthorId = folder.value.author.id
  const folderUsersIds = new Set([folder.value.author.id, ...formData.sharedUsers])

  return users.value.map((user) => {
    let selected = false

    if (folderUsersIds.has(user.id)) {
      selected = true
    }

    const disabled = user.id === folderAuthorId

    return {
      value: user,
      label: `${user.fullName.firstName[0]}. ${user.fullName.lastName}`,
      disabled,
      selected,
    }
  })
})

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

async function submitForm(formEl) {
  if (isSending.value === true) {
    return
  }

  if (!formEl) {
    return
  }

  isSending.value = true
  openLoading()

  let isValid = true

  await formEl.validate((valid) => {
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
    await FolderService.update(id.value, formData)

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

const rules = reactive({ name: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'blur' }] })

async function getData() {
  try {
    await Promise.all([getUsers(), getFolder()])
  } catch (error) {
    if (error.request.data.title) {
      openNotification({
        title: 'Error',
        message: error.request.data.title,
        type: 'error',
      })
    }
  }
}

async function getUsers() {
  const response = await UserService.getUsers()

  users.value = response.data.data
}

async function getFolder() {
  const response = await FolderService.getFolder(route.params.id)
  const responseFolder = response.data.data

  folder.value = responseFolder
  const allSharedIds = responseFolder.sharedUsers.map((user) => user.id)

  id.value = responseFolder.id
  formData.name = responseFolder.name
  formData.sharedUsers = allSharedIds
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
    <div class="update-folder-page">
      <ElCard shadow="never" class="update-folder-page__card">
        <NForm
          ref="formRef"
          class="form form--update-folder"
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
              <NButton appearance="primary" @click="submitForm(formRef)"> Редактировать </NButton>
              <NButton plain @click="router.back()"> Назад </NButton>
            </ElCol>
          </ElRow>
        </NForm>
      </ElCard>
    </div>
  </NScrollbar>
</template>

<style>
.update-folder-page {
  padding: 2rem;
}

.update-folder-page__card {
  width: 600px;
}

.form--update-folder .form-actions {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}
</style>
