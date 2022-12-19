<script setup>
defineProps({
  to: {
    type: [String, Object],
    required: true,
  },
})
</script>

<template>
  <router-link class="v-link" exact-active-class="v-link--active" :to="to">
    <span class="v-link__text" />
    <slot />
  </router-link>
</template>

<style>
.v-link {
  --brand-color: var(--el-color-primary);
  --text-color-light: var(--el-text-color-regular);

  display: inline-block;

  padding: 10px 16px;

  color: var(--brand-color);
  font-weight: 500;
  font-size: 0.9rem;
  line-height: 1.5;
  text-decoration: inherit;

  border-radius: 8px;
}

.v-link:hover {
  color: var(--brand-color);
  text-decoration: none;
}

.v-link--active {
  background-color: hsl(218deg 100% 94%);
}

.v-link .v-link__text {
  margin: 0;

  color: var(--text-color-light);
  font-weight: 500;
  font-size: 13px;
  line-height: 20px;

  transition: color 0.5s;
}

.v-link--active .v-link__text {
  color: var(--brand-color);
  font-weight: 600;

  transition: color 0.25s;
}

.v-link:hover .v-link__text {
  color: var(--brand-color);

  transition: color 0.25s;
}
</style>
