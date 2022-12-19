<script setup>
import { NButton } from '@nado/nado-vue-ui'
import { ElCard } from 'element-plus'
import { ref } from 'vue'

import VTitle from '../../../components/VTitle/VTitle.vue'
import { useLoading } from '../../../composables/useLoading.js'
import { useNotification } from '../../../composables/useNotification.js'
import { UserService } from '../../../services/UserService.js'
import { useUserStore } from '../../../store/user.js'

const userStore = useUserStore()

const isSending = ref(false)
const { open: openLoading, close: closeLoading } = useLoading()
const { open: openNotification } = useNotification()

async function verifyEmail() {
  if (isSending.value === true) {
    return
  }

  isSending.value = false
  openLoading()

  try {
    const url = new URLSearchParams(window.location.search).get('api_url')

    await UserService.verifyEmail(url)

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
</script>

<template>
  <div class="verification-notification-page">
    <ElCard shadow="never" class="verification-notification-page__card">
      <template #header>
        <VTitle>Подтвердить почту</VTitle>
      </template>
      <ElRow>
        <ElCol class="form-actions">
          <div>
            <NButton @click="verifyEmail">Подтвердить</NButton>
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
