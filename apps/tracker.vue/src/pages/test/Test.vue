<script setup>
import { AxiosError, CanceledError } from 'axios'
import { ref } from 'vue'

import NUpload from '../../components/NUpload/NUpload.vue'
import { TaskService } from '../../services/TaskService.js'

const fileList = ref([])

const handleSendChunk = async (chunk) => {
  const data = chunk.getRequestChunk()
  const params = chunk.getRequestParams()
  const fileFormData = new FormData()

  fileFormData.append('file', data, chunk.getResumableFile().getName())

  try {
    const response = await TaskService.addFile('', fileFormData, params, chunk)

    chunk.doneSend(true, response.data)
  } catch (error) {
    if (error instanceof CanceledError) {
      chunk.doneAbort()

      return
    }

    if (error instanceof AxiosError) {
      chunk.doneSend(false, true, error.response?.data)

      return
    }

    chunk.doneSend(false, true)
  }
}

async function handleRemoveFile(payload) {
  const { data } = payload.data

  try {
    await TaskService.removeFile(data.id)
  } catch (error) {
    console.error(error)
  }
}

async function handlePreviewFile(payload) {
  const { data } = payload.data

  try {
    const response = await TaskService.downloadFile(data.id)
    const fileUrl = window.URL.createObjectURL(response.data)
    const docUrl = document.createElement('a')

    docUrl.href = fileUrl
    docUrl.setAttribute('download', data.name)
    document.body.append(docUrl)
    docUrl.click()
    docUrl.remove()
    window.URL.revokeObjectURL(fileUrl)
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div>
    <NUpload
      v-model:file-list="fileList"
      :on-send-chunk="handleSendChunk"
      :on-remove-file="handleRemoveFile"
      @preview="handlePreviewFile"
    />
  </div>
</template>
