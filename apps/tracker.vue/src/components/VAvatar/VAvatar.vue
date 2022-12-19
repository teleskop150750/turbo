<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: Number,
    default: 32,
  },
  tag: {
    type: String,
    default: 'div',
  },
})

const styles = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}))
</script>

<template>
  <component :is="tag" class="v-avatar" :style="styles">
    <slot />
  </component>
</template>

<style>
.v-avatar {
  position: relative;

  display: inline-flex;
  justify-content: center;
  align-items: center;

  color: var(--el-color-white);
  line-height: normal;
  text-align: center;
  vertical-align: middle;

  border-radius: 50%;

  background-color: var(--el-color-primary);

  overflow: hidden;
}

.v-avatar img {
  display: inline-flex;

  width: 100%;
  height: 100%;

  border-radius: inherit;

  object-fit: cover;
  object-position: center;
}
</style>
