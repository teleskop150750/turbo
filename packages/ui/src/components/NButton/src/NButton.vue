<script setup lang="ts">
import { buttonProps } from "./button";

defineProps(buttonProps);
</script>

<script lang="ts">
export default {
  name: "NButton",
};
</script>

<template>
  <button type="button">{{ label }} | button</button>
</template>
