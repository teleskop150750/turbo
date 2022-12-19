<script setup>
defineProps({
  to: {
    type: [String, Object],
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <RouterLink
    class="n-aside-menu-link"
    :class="[compact && 'n-aside-menu-link--compact']"
    exact-active-class="n-aside-menu-link--active"
    :to="to"
  >
    <div class="n-aside-menu-link__icon">
      <slot name="icon" />
    </div>
    <span class="n-aside-menu-link__text">
      <slot />
    </span>
  </RouterLink>
</template>

<style>
.n-aside-menu-link {
  --n-comp-aside-menu-link-color-text: var(--n-ref-palette-white);
  --n-comp-aside-menu-link-color-text-active: var(--n-sys-color-primary);

  position: relative;

  display: inline-flex;
  justify-content: flex-start;
  align-items: center;

  width: 100%;
  padding: 0.25rem 1rem;

  color: var(--n-comp-aside-menu-link-color-text);
  font-weight: 500;
  text-decoration: inherit;
}

.n-aside-menu-link:hover {
  --n-comp-aside-menu-link-color-text: var(--n-comp-aside-menu-link-color-text-active);
}

.n-aside-menu-link--active {
  --n-comp-aside-menu-link-color-text: var(--n-comp-aside-menu-link-color-text-active);
}

.n-aside-menu-link--active::before {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  content: '';

  width: 0.5rem;

  background-color: currentcolor;
}

.n-aside-menu-link__icon {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;

  width: 48px;
  height: 32px;
}

.n-aside-menu-link__icon svg {
  display: block;

  width: 28px;
  height: 28px;
}

.n-aside-menu-link__text {
  font-weight: var(--n-sys-font-weight-bold);
  font-size: 18px;
  white-space: nowrap;

  opacity: 1;

  transition: color 0.5s, opacity 0.3s;
}

.n-aside-menu-link--compact .n-aside-menu-link__text {
  opacity: 0;

  transition: opacity 0.1s;
}
</style>
