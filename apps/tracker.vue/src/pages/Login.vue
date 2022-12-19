<script setup>
import { NButton, NForm, NFormItem, NInput } from '@nado/nado-vue-ui'
import { ElCard, ElCol, ElRow } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import VTitle from '../components/VTitle/VTitle.vue'
import { useLoading } from '../composables/useLoading.js'
import { useNotification } from '../composables/useNotification.js'
import { UserService } from '../services/UserService.js'
import { useUserStore } from '../store/user.js'

const { open: openLoading, close: closeLoading } = useLoading()
const { open: openNotification } = useNotification()
const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const isSending = ref(false)

const formData = reactive({
  email: '',
  password: '',
})

const formError = reactive({
  email: '',
  password: '',
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
    const user = await UserService.login(formData)

    userStore.login(user.data.data)
    router.push({ name: 'home' })
    openNotification({
      title: 'Успех',
      message: 'Успешная аутентификация',
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
  email: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'blur' }],
  password: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'blur' }],
})
</script>

<template>
  <div class="registration-page">
    <ElCard shadow="never" class="registration-page__card">
      <template #header>
        <VTitle>Вход</VTitle>
      </template>
      <NForm
        ref="formRef"
        class="form form--registration"
        :model="formData"
        :rules="rules"
        status-icon
        label-position="top"
      >
        <ElRow :gutter="20">
          <ElCol :span="12">
            <NFormItem label="Email" prop="email" :error="formError.email">
              <NInput v-model="formData.email" autocomplete="off" />
            </NFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="20">
          <ElCol :span="12">
            <NFormItem label="Пароль" prop="password" :error="formError.password">
              <NInput v-model="formData.password" type="password" autocomplete="off" />
            </NFormItem>
          </ElCol>
        </ElRow>

        <ElRow>
          <ElCol class="form-actions">
            <div>
              <NButton appearance="primary" @click="submitForm(formRef)"> Войти </NButton>
              <NButton @click="resetForm(formRef)"> Сбросить </NButton>
            </div>
            <div>
              <NButton :to="{ name: 'reset-password' }"> Забыли пароль </NButton>
              <NButton :to="{ name: 'register' }"> Зарегистрироваться </NButton>
            </div>
          </ElCol>
        </ElRow>
      </NForm>
    </ElCard>
  </div>
</template>

<style>
.registration-page {
  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 100vh;
  padding: 1rem;
}

.registration-page__card {
  width: 600px;
}

.form--registration .form-actions {
  display: flex;
  gap: 1rem;

  margin-top: 1rem;
}

.form--registration .form-actions > * {
  margin: 0 !important;
}

.form--registration .form-actions > *:last-child {
  margin-left: auto !important;
}
</style>
