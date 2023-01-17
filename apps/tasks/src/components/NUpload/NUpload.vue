<script setup>
// @ts-ignore
import { NButton } from '@nadoapps/ui'
import { Resumable } from '@teleskop150750/resumable'
import { Md5 } from 'ts-md5'
import { computed, ref } from 'vue'

import NUploadFile from './NUploadFile.vue'
import { uploadProps } from './upload.js'

const props = defineProps(uploadProps)
const emit = defineEmits(['update:fileList', 'delete', 'preview'])

const inputRef = ref()
const progressPercent = ref(0)
const showProgress = ref(false)

const progressBarStyle = computed(() => ({
  width: `${progressPercent.value}%`,
}))

const handleSendChunk = (chunk) => {
  props.onSendChunk(chunk)
}

const handleTestChunk = (chunk) => {
  props.onTestChunk(chunk)
}

const resumable = new Resumable({
  chunkSize: props.chunkSize,
  simultaneousUploads: props.simultaneousUploads,
  handleSendChunk,
  handleTestChunk,
  testChunks: false,
  generateUniqId(fileWithPath) {
    const relativePath = fileWithPath.relativePath || fileWithPath.file.webkitRelativePath || fileWithPath.file.name

    return Md5.hashStr(
      `${relativePath.replaceAll(/[^\w-]/gim, '')}-${fileWithPath.file.size}-${fileWithPath.file.lastModified}`,
    )
  },
})

resumable.on('fileAdded', (resumableFile) => {
  showProgress.value = true

  const newFile = {
    id: resumableFile.getUniqueId(),
    name: resumableFile.getName(),
    progress: Math.floor(resumableFile.getProgress() * 100),
    data: resumableFile.getResponse(),
  }

  emit('update:fileList', [...props.fileList, newFile])
})

resumable.on('fileProgress', (resumableFile) => {
  const fileId = resumableFile.getUniqueId()
  const fileList = [...props.fileList]

  const newFileList = fileList.map(
    /** @param {any} el */
    (el) => {
      if (el.id === fileId) {
        el.progress = Math.floor(resumableFile.getProgress() * 100)
        el.data = resumableFile.getResponse()
      }

      return el
    },
  )

  emit('update:fileList', newFileList)

  progressPercent.value = Math.floor(resumable.getProgress() * 100)
})

resumable.on('fileSuccess', (file) => {
  const fileId = file.getUniqueId()
  const fileList = [...props.fileList]

  const newFileList = fileList.map(
    /** @param {any} el */
    (el) => {
      if (el.id === fileId) {
        el.progress = 100
        el.data = file.getResponse()
      }

      return el
    },
  )

  emit('update:fileList', newFileList)
})

resumable.on('fileError', (file, message = '') => {
  const fileId = file.getUniqueId()
  const fileList = [...props.fileList]

  const newFileList = fileList.map(
    /** @param {any} el */
    (el) => {
      if (el.id === fileId) {
        el.data = message
      }

      return el
    },
  )

  emit('update:fileList', newFileList)
})

async function handleAddFile(evt) {
  await resumable.handleInputChange(evt)
  resumable.upload()
}

function handleSelectFile() {
  if (inputRef.value) {
    inputRef.value.click()
  }
}

async function handleRemoveFile(payload) {
  try {
    await props.onRemoveFile(payload)
    const file = resumable.getResumableFileByUid(payload.id)

    if (file) {
      resumable.removeResumableFile(file)
    }

    const newList = props.fileList.filter((el) => el.id !== payload.id)

    emit('update:fileList', newList)
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div class="n-upload-file">
    <input ref="inputRef" class="n-upload-file__input" type="file" name="file" @change="handleAddFile" />

    <div class="n-upload-file__actions">
      <NButton class="n-upload-file__add" label="Добавить файл" @click="handleSelectFile" />
    </div>

    <div v-if="showProgress" class="n-upload-file__progress">
      <div class="n-upload-file__progress-bar" :style="progressBarStyle"></div>
    </div>

    <div v-if="fileList.length > 0" class="n-upload-file__list">
      <NUploadFile
        v-for="file in fileList"
        :key="file.id"
        :file="file"
        class="n-upload-file__item"
        @remove="handleRemoveFile"
      />
    </div>

    <div v-else class="n-upload-file__empty">Пусто</div>
  </div>
</template>

<style>
.n-upload-file__input {
  display: none;
}

.n-upload-file__progress {
  width: 100%;
  height: 20px;
  margin-top: 1rem;
  padding: 2px;

  border: 3px solid hsl(144deg 96% 45%);
}

.n-upload-file__progress-bar {
  width: 0%;
  height: 100%;

  background-color: hsl(144deg 96% 45%);

  animation: fill-bar 3s infinite;
}

.n-upload-file__list {
  display: grid;
  grid-template-rows: min-content;
  grid-template-columns: 100%;
  gap: 1rem;

  margin-top: 24px;
}

.n-upload-file__empty {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
}
</style>
