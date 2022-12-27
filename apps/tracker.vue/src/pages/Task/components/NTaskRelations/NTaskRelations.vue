<script setup>
import { computed, watch } from 'vue'

import NTaskRelationsBlock from './NTaskRelationsBlock.vue'

const props = defineProps({
  tasks: {
    type: Array,
    default: () => [],
  },
  affects: {
    type: Array,
    default: () => [],
  },
  depends: {
    type: Array,
    default: () => [],
  },
  minDate: {
    type: Object,
    default: undefined,
  },
  maxDate: {
    type: Object,
    default: undefined,
  },
})

const emit = defineEmits(['update:minDate', 'update:maxDate', 'update:affects', 'update:depends'])

const tasksOptions = computed(() => {
  const ids = new Set([...props.affects, ...props.depends])

  return props.tasks
    .map((task) => ({
      value: task,
      label: `${task.name}`,
      disabled: ids.has(task.id),
      id: task.id,
    }))
    .filter((el) => el.disabled === false)
})

const tasksDepends = computed(() => {
  const ids = new Set(props.depends)

  return props.tasks
    .map((task) => ({
      value: task,
      label: `${task.name}`,
      disabled: ids.has(task.id),
      id: task.id,
    }))
    .filter((el) => ids.has(el.id))
})

const tasksAffects = computed(() => {
  const ids = new Set(props.affects)

  return props.tasks
    .map((task) => ({
      value: task,
      label: `${task.name}`,
      disabled: ids.has(task.id),
      id: task.id,
    }))
    .filter((el) => ids.has(el.id))
})

const tasksMap = computed(() => Object.fromEntries(props.tasks.map((item) => [item.id, item])))

function updateDepends(val) {
  emit('update:depends', val)
}

function updateAffects(val) {
  emit('update:affects', val)
}

function getMinDate(depends) {
  if (depends === undefined || depends === null) {
    return undefined
  }

  if (depends.length === 0) {
    return undefined
  }

  const dates = depends.map((id) => new Date(tasksMap.value[id].endDate).getTime())

  if (dates.length === 0) {
    return undefined
  }

  const localeDate = new Date(Math.max(...dates))

  return new Date(localeDate.getTime())
}

function getMaxDate(affects) {
  if (affects === undefined || affects === null) {
    return undefined
  }

  if (affects.length === 0) {
    return undefined
  }

  const dates = affects.map((id) => new Date(tasksMap.value[id].startDate).getTime())

  if (dates.length === 0) {
    return undefined
  }

  const localeDate = new Date(Math.min(...dates))

  return new Date(localeDate.getTime())
}

watch(
  () => props.depends,
  (val) => {
    emit('update:maxDate', getMaxDate(val))
  },
  {
    immediate: true,
  },
)

watch(
  () => props.affects,
  (val) => {
    emit('update:minDate', getMinDate(val))
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <div class="n-task-relations">
    <NTaskRelationsBlock :selected="tasksDepends" :tasks="tasksOptions" @update:ids="updateDepends">
      <template #title> Эта задача блокирует: </template>
      <template #description>
        Эта задача блокирует выбранные ниже. Их нельзя начать, пока не завершится эта задача
      </template>
    </NTaskRelationsBlock>
    <NTaskRelationsBlock :selected="tasksAffects" :tasks="tasksOptions" @update:ids="updateAffects">
      <template #title> Эта задача зависит от: </template>
      <template #description>
        Эта задача зависит от выбранных ниже. Пока они не завершатся, эту задачу нельзя начать
      </template>
    </NTaskRelationsBlock>
  </div>
</template>

<style>
.n-task-relations {
  display: grid;
  gap: 1rem;

  max-width: 350px;
}
</style>
