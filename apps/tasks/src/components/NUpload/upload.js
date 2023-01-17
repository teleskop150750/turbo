export const uploadProps = {
  fileList: {
    type: Array,
    default: () => [],
  },
  chunkSize: {
    type: Number,
    default: 1 * 1024 * 1024,
  },
  simultaneousUploads: {
    type: Number,
    default: 1,
  },
  onSendChunk: {
    type: Function,
    default: () => {},
  },
  onTestChunk: {
    type: Function,
    default: () => {},
  },
  onRemoveFile: {
    type: Function,
    default: () => {},
  },
}

export const uploadFileProps = {
  file: {
    type: Object,
    required: true,
  },
}
