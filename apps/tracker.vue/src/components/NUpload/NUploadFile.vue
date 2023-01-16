<script setup>
import { NButton } from '@nado/nado-vue-ui'
import { computed } from 'vue'

import { uploadFileProps } from './upload.js'

const props = defineProps(uploadFileProps)
const emit = defineEmits(['remove'])

const isFullLoaded = computed(() => {
  if (!props.file) {
    return false
  }

  if (!props.file.data) {
    return false
  }

  if (!props.file.data || !props.file.data.id) {
    return false
  }

  return true
})

function handleRemove() {
  if (!isFullLoaded.value) {
    return
  }

  emit('remove', props.file)
}
</script>

<template>
  <div class="n-upload-file-item">
    <div class="n-upload-file-item__name">{{ file.name }}</div>
    <div class="n-upload-file-item__left">
      <span class="n-upload-file-item__progress">{{ file.progress }}</span>
      <div v-if="isFullLoaded" class="n-upload-file-item__actions">
        <NButton
          class="n-upload-file-item__delete"
          label="Скачать"
          size="small"
          target="_blank"
          :href="file.data.link"
        />
        <NButton
          class="n-upload-file-item__delete"
          appearance="primary"
          plain
          label="Удалить"
          size="small"
          @click="handleRemove"
        />
      </div>
    </div>
  </div>
</template>

<style>
.n-upload-file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  min-height: 42px;
  padding: 0.5rem 1rem;

  border-bottom: 1px solid hsl(0deg 0% 80%);
}

.n-upload-file-item__name {
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;

  overflow: hidden;
}

.n-upload-file-item__left {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.n-upload-file-item__actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}
</style>
