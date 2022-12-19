<script setup>
import { NButton, NForm, NFormItem, NInput } from '@nado/nado-vue-ui'
import { ElCard, ElCol, ElRow } from 'element-plus'
import { reactive, ref } from 'vue'

import VTitle from '../../../components/VTitle/VTitle.vue'
import { useLoading } from '../../../composables/useLoading.js'
import { useNotification } from '../../../composables/useNotification.js'
import { UserService } from '../../../services/UserService.js'
import { useUserStore } from '../../../store/user.js'

const userStore = useUserStore()

const formRef = ref()
const isSending = ref(false)
const { open: openLoading, close: closeLoading } = useLoading()
const { open: openNotification } = useNotification()

const formData = reactive({
  email: '',
  password: '',
  passwordConfirm: '',
})

const formError = reactive({
  email: '',
  password: '',
  passwordConfirm: '',
})

async function resetPassword(formElement) {
  if (isSending.value === true) {
    return
  }

  if (!formElement) {
    return
  }

  let isValid = true

  await formElement.validate((valid) => {
    if (!valid) {
      isValid = false
    }
  })

  if (!isValid) {
    return
  }

  isSending.value = true
  openLoading()

  try {
    const token = new URLSearchParams(window.location.search).get('token')

    await UserService.resetPassword(token, formData)

    openNotification({
      title: 'Успех',
      message: 'Подтверждение прошло успешно',
      type: 'success',
    })
    userStore.verify()
  } catch (error) {
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
  email: [{ required: true, message: 'Поле обязательно для заполнения', trigger: 'blur' }],
  password: [{ required: true, validator: validatePassword, trigger: 'blur' }],
  passwordConfirm: [{ required: true, validator: validatePasswordConfirm, trigger: 'blur' }],
})

function validatePassword(rule, value, callback) {
  if (value === '') {
    callback(new Error('Поле обязательно для заполнения'))
  } else if (formData.passwordConfirm !== '') {
    formRef.value.validateField('passwordConfirm', () => null)
    callback()
  }
}

function validatePasswordConfirm(rule, value, callback) {
  if (value === '') {
    callback(new Error('Поле обязательно для заполнения'))
  } else if (value !== formData.password) {
    callback(new Error('Пароли не совпадают!'))
  } else {
    formRef.value.validateField('password', () => null)
    callback()
  }
}
</script>

<template>
  <div class="reset-password-page">
    <ElCard shadow="never" class="reset-password-page__card">
      <template #header>
        <VTitle>Сбросить пароль</VTitle>
      </template>
      <NForm ref="formRef" class="form form--registration" :model="formData" :rules="rules">
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
        <ElRow :gutter="20">
          <ElCol :span="12">
            <NFormItem label="Подтверждение пароля" prop="passwordConfirm" :error="formError.passwordConfirm">
              <NInput v-model="formData.passwordConfirm" type="password" autocomplete="off" />
            </NFormItem>
          </ElCol>
        </ElRow>
        <ElRow>
          <ElCol class="reset-form-actions">
            <div>
              <NButton appearance="primary" @click="resetPassword(formRef)"> Сбросить </NButton>
            </div>
            <div>
              <NButton :to="{ name: 'login' }"> Войти </NButton>
            </div>
          </ElCol>
        </ElRow>
      </NForm>
    </ElCard>
  </div>
</template>

<style>
.reset-password-page {
  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 100vh;
  padding: 1rem;
}

.reset-password-page__card {
  width: 600px;
}

.reset-form-actions {
  display: flex;
  justify-content: space-between;
}
</style>
