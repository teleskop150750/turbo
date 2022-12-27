<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { FOLDER_TYPE } from './constants.js'

// import { ClickOutside as vClickOutside } from './click-outside/index.js'

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
})
// const emit = defineEmits(['before-enter'])

// const buttonRef = ref()
// const popoverRef = ref()
// const isOpening = ref(false)

// const onClickOutside = () => {
//   // unref(popoverRef).popperRef?.delayHide?.()
// }

// const append = (data) => {
//   console.log(data)
//   // const newChild = { id: id++, label: 'testtest', children: [] }
//   // if (!data.children) {
//   //   data.children = []
//   // }
//   // data.children.push(newChild)
//   // dataSource.value = [...dataSource.value]
// }

// const remove = (node, data) => {
//   console.log(node, data)
//   // const { parent } = node
//   // const children = parent.data.children || parent.data
//   // const index = children.findIndex((d) => d.id === data.id)
//   // children.splice(index, 1)
//   // dataSource.value = [...dataSource.value]
// }

// function handlerBeforeEnter() {
//   isOpening.value = true
//   emit('before-enter')
// }

// function handlerAfterEnter() {
//   isOpening.value = false
// }

// function hideContextMenu() {
//   unref(popoverRef).popperRef?.delayHide?.()
// }

// defineExpose({
//   hideContextMenu,
// })

// ref="buttonRef" v-click-outside="onClickOutside" class="menu-tree-node__label"

const link = computed(() => {
  if (props.node.data.type === FOLDER_TYPE.ALL) {
    return { name: 'tasks-all' }
  }

  if (props.node.data.type === FOLDER_TYPE.AUTHOR) {
    return { name: 'tasks-author' }
  }

  if (props.node.data.type === FOLDER_TYPE.EXECUTOR) {
    return { name: 'tasks-executor' }
  }

  if (props.node.data.type === FOLDER_TYPE.UNASSEMBLED) {
    return { name: 'tasks-unassembled' }
  }

  if (props.node.data.type === FOLDER_TYPE.ROOT_USER) {
    return { name: 'folder-me' }
  }

  if (props.node.data.type === FOLDER_TYPE.ROOT_SHARED) {
    return { name: 'folder-shared' }
  }

  return { name: 'folder-tasks', params: { id: props.node.data.id } }
})
// v-if="link"
</script>

<template>
  <span class="menu-tree-node">
    <RouterLink v-if="link" :to="link" class="menu-tree-node__label">{{ node.label }}</RouterLink>
    <span v-else class="menu-tree-node__label">{{ node.label }}</span>
  </span>

  <!-- <ElPopover
    ref="popoverRef"
    :virtual-ref="buttonRef"
    trigger="contextmenu"
    title="With title"
    virtual-triggering
    @before-enter="handlerBeforeEnter"
    @after-enter="handlerAfterEnter"
  >
    <span> Some content </span>
  </ElPopover> -->
</template>

<style>
.menu-tree-node {
  display: flex;

  width: 100%;

  overflow: hidden;
}

.menu-tree-node__label {
  width: 100%;

  color: white;
  white-space: nowrap;
  text-overflow: ellipsis;

  overflow: hidden;
}
</style>
