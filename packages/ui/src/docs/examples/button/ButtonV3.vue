<script setup>
import { NButton } from '../../../components/index.js'
import { NIconPlus } from '../../../icons/index.js'

function buttonOnClick() {
  // eslint-disable-next-line no-console
  console.log('CLICK')
}
</script>

<template>
  <h3 class="n-title-3">Label + Icon</h3>
  <div class="row">
    <div class="col">
      <NButton :icon="NIconPlus" label="Кнопка" @click="buttonOnClick" />
    </div>
    <div class="col">
      <NButton :icon="NIconPlus" label="Кнопка" plain @click="buttonOnClick" />
    </div>
    <div class="col">
      <NButton :icon="NIconPlus" label="Кнопка" plain disabled @click="buttonOnClick" />
    </div>
  </div>
</template>
