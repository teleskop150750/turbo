<script setup>
import { ElCol, ElRow } from 'element-plus'
import { inject } from 'vue'

import { LAYOUT_DEFAULT_KEY } from '../../tokens/layout-default.js'
import FormInfo from './components/FormInfo.vue'
import FormPassword from './components/FormPassword.vue'

const layout = inject(LAYOUT_DEFAULT_KEY)

layout.setTitle('Профиль')
</script>

<template>
  <div class="profile-page">
    <div class="profile-page__form">
      <ElRow :gutter="20">
        <ElCol :span="12">
          <FormInfo />
        </ElCol>
        <ElCol :span="12">
          <FormPassword />
        </ElCol>
      </ElRow>
    </div>
  </div>
</template>

<style>
.profile-page__form {
  /* width: 600px; */
  padding: 2rem;
}
</style>
