<script setup>
import { NButton, NForm, NFormItem, NInput, NRadio, NSelectV2 } from '@nado/nado-vue-ui'
import { ElCard, ElCol, ElRow } from 'element-plus'
import { computed, inject, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// import VTitle from '../../components/VTitle/VTitle.vue'
import { useLoading } from '../../composables/useLoading.js'
import { useNotification } from '../../composables/useNotification.js'
import { FolderService } from '../../services/FolderService.js'
import { UserService } from '../../services/UserService.js'
import { useUserStore } from '../../store/user.js'
import { LAYOUT_DEFAULT_KEY } from '../../tokens/layout-default.js'
import { FOLDER_ACCESS } from '../../tracker/folder.js'

const layout = inject(LAYOUT_DEFAULT_KEY)

layout.setTitle('Редактировать папку')
const { open: openLoading, close: closeLoading } = useLoading()
const { open: openNotification } = useNotification()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const currentUser = userStore.getUser()
const formRef = ref()
const isSending = ref(false)

const formData = reactive({
  id: '',
  name: '',
  access: '',
  sharedUsers: [],
})

const formError = reactive({
  name: '',
  parent: '',
  access: '',
  sharedUsers: '',
})

const responseUsers = ref([])
const folderOptions = ref([])
const disableSharedUsersIds = ref([])
const parentFolder = ref(null)
const currentFolder = ref(null)

const userOptions = computed(() =>
  responseUsers.value.map((rawUser) => {
    let disabled = false

    disabled = !currentFolder.value
      ? rawUser.id === currentUser.value.id
      : disableSharedUsersIds.value.includes(rawUser.id)

    return {
      value: rawUser,
      label: `${rawUser.fullName.firstName[0]}. ${rawUser.fullName.lastName}`,
      disabled,
    }
  }),
)

const isShowFolderAccessSelect = computed(() => {
  if (!parentFolder.value) {
    return false
  }

  return parentFolder.value.access !== FOLDER_ACCESS.PUBLIC
})

const isCanSelectPrivate = computed(() => {
  if (!parentFolder.value) {
    return false
  }

  return parentFolder.value.access === FOLDER_ACCESS.PRIVATE
})

const isCanSelectLimit = computed(() => {
  if (!parentFolder.value) {
    return false
  }

  return [FOLDER_ACCESS.LIMIT, FOLDER_ACCESS.PRIVATE].includes(parentFolder.value.access)
})

const isCanSelectPublic = computed(() => {
  if (!parentFolder.value) {
    return false
  }

  return true
})

const isCanSelectSharedUsers = computed(() => {
  if (!currentFolder.value) {
    return false
  }

  return formData.access === FOLDER_ACCESS.LIMIT
})

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

  if (formData.access !== FOLDER_ACCESS.LIMIT) {
    formData.sharedUsers = []
  }

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
    await FolderService.update(formData)
    // await getData()

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
    await getFolders()
    await Promise.all([getUsers(), getFolder()])
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
  const rawFolders = response.data.data.folders

  folderOptions.value = rawFolders.map((rawFolder) => ({
    value: rawFolder,
    label: `${rawFolder.name}`,
  }))
}

async function getFolder() {
  const response = await FolderService.getFolder(route.params.id)
  const responseFolder = response.data.data.folder
  const sharedIds = responseFolder.sharedUsers.map((user) => user.id)
  const allSharedIds = responseFolder.allInheritSharedUsers.map((user) => user.id)
  const difference = allSharedIds.filter((id) => !sharedIds.includes(id))

  currentFolder.value = responseFolder
  parentFolder.value = responseFolder.parentFolder
  formData.id = responseFolder.id
  formData.name = responseFolder.name
  formData.access = responseFolder.access
  formData.sharedUsers = sharedIds
  disableSharedUsersIds.value = difference
}

async function getDataInit() {
  openLoading()
  await getData()
  closeLoading()
}

getDataInit()
</script>

<template>
  <div class="update-folder-page">
    <ElCard shadow="never" class="update-folder-page__card">
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
        </ElRow>

        <ElRow v-if="isShowFolderAccessSelect" :gutter="20">
          <ElCol :span="24">
            <NFormItem label="Доступ" prop="access" :error="formError.access">
              <div class="n-radio-group">
                <NRadio v-if="isCanSelectPrivate" v-model="formData.access" val="PRIVATE"> Приватный </NRadio>
                <NRadio v-if="isCanSelectLimit" v-model="formData.access" val="LIMIT">
                  Ограниченное число пользователей
                </NRadio>
                <NRadio v-if="isCanSelectPublic" v-model="formData.access" val="PUBLIC"> Доступно всем </NRadio>
              </div>
            </NFormItem>
          </ElCol>
        </ElRow>

        <ElRow v-if="isCanSelectSharedUsers" :gutter="20">
          <ElCol :span="24">
            <NFormItem label="Доступ" prop="access" :error="formError.access">
              <NSelectV2
                v-model="formData.sharedUsers"
                value-key="value.id"
                clearable
                multiple
                filterable
                :options="userOptions"
                style="width: 100%"
                placeholder="Выберите"
              />
            </NFormItem>
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
</template>

<style>
.update-folder-page {
  padding: 2rem;
}

.update-folder-page__card {
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
