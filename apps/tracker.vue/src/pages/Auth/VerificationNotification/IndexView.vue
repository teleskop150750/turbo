<script setup>
import { NButton } from '@nado/nado-vue-ui'
import { ElCard } from 'element-plus'
import { ref } from 'vue'

import VTitle from '../../../components/VTitle/VTitle.vue'
import { useLoading } from '../../../composables/useLoading.js'
import { useNotification } from '../../../composables/useNotification.js'
import { UserService } from '../../../services/UserService.js'

const isSending = ref(false)
const { open: openLoading, close: closeLoading } = useLoading()
const { open: openNotification } = useNotification()

async function sendNewEmail() {
  if (isSending.value === true) {
    return
  }

  isSending.value = false
  openLoading()

  try {
    await UserService.sendNewEmail()

    openNotification({
      title: 'Успех',
      message: 'Письмо с подтверждением отправлено',
      type: 'success',
    })
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
</script>

<template>
  <div class="verification-notification-page">
    <ElCard shadow="never" class="verification-notification-page__card">
      <template #header>
        <VTitle>Подтвердите почту</VTitle>
      </template>
      <p>
        Прежде чем продолжить, пожалуйста, проверьте свою электронную почту на наличие ссылки для подтверждения. Если вы
        не получили электронное письмо, нажмите здесь, чтобы запросить другое.
      </p>
      <ElRow>
        <ElCol class="form-actions">
          <div>
            <NButton @click="sendNewEmail">Запросить другое</NButton>
          </div>
          <div>
            <NButton :to="{ name: 'login' }"> Войти </NButton>
          </div>
        </ElCol>
      </ElRow>
    </ElCard>
  </div>
</template>

<style>
.verification-notification-page {
  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 100vh;
  padding: 1rem;
}

.verification-notification-page__card {
  width: 600px;
}
</style>
