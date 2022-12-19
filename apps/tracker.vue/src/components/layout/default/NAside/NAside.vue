<script setup>
import { NIconChevronDoubleLeft, NIconDelete } from '@nado/nado-vue-ui'
import { getCurrentInstance, ref, watch } from 'vue'

import NIconLogo from '../../../icons/NIconLogo.vue'
import NAsideMenuLink from './NAsideMenuLink.vue'

const isOpen = ref(false)

// function open() {
//   isOpen.value = true
// }

function close() {
  isOpen.value = false
}

function toggle() {
  isOpen.value = !isOpen.value
}

const vm = getCurrentInstance()

watch(
  () => ({
    // eslint-disable-next-line unicorn/consistent-destructuring
    ...vm.proxy.$route,
  }),
  () => {
    close()
  },
)
</script>

<template>
  <aside class="n-aside" :class="[!isOpen && 'n-aside--close']">
    <div class="n-aside__header">
      <RouterLink class="n-aside__header-link" :to="{ name: 'home' }">
        <span class="n-aside__header-link-icon">
          <NIconLogo />
        </span>
        <span class="n-aside__header-link-text"> nado </span>
      </RouterLink>
    </div>
    <ul class="n-aside__menu">
      <li class="n-aside__menu-item">
        <NAsideMenuLink :to="{ name: 'workspace' }" :compact="!isOpen">
          <template #icon>
            <NIconDelete />
          </template>
          Личное
        </NAsideMenuLink>
      </li>

      <li class="n-aside__menu-item">
        <NAsideMenuLink :to="{ name: 'tasks-main' }" :compact="!isOpen">
          <template #icon>
            <NIconDelete />
          </template>
          Мои задачи
        </NAsideMenuLink>
      </li>
      <li class="n-aside__menu-item">
        <NAsideMenuLink :to="{ name: 'tasks-created' }" :compact="!isOpen">
          <template #icon>
            <NIconDelete />
          </template>
          Созданные мной
        </NAsideMenuLink>
      </li>

      <li class="n-aside__menu-item">
        <NAsideMenuLink :to="{ name: 'shared' }" :compact="!isOpen">
          <template #icon>
            <NIconDelete />
          </template>
          Доступные для меня
        </NAsideMenuLink>
      </li>

      <li class="n-aside__menu-item">
        <NAsideMenuLink :to="{ name: 'archive' }" :compact="!isOpen">
          <template #icon>
            <NIconDelete />
          </template>
          Корзина
        </NAsideMenuLink>
      </li>
    </ul>
    <div class="n-aside__footer">
      <div class="n-aside__footer-toggle-wrapper">
        <button class="n-aside__footer-toggle" type="button" @click="toggle">
          <NIconChevronDoubleLeft class="n-aside__footer-toggle-icon" />
        </button>
      </div>
    </div>
  </aside>
</template>

<style>
.n-aside {
  display: flex;
  flex-direction: column;

  width: 280px;
  height: 100%;
  padding: 1.5rem 0;

  background-color: var(--n-sys-color-secondary-800);

  overflow: hidden;

  transition: width 0.3s;
}

.n-aside--close {
  width: 78px;
}

.n-aside__header {
  width: 100%;
  margin-bottom: 2rem;
  padding: 0 0.75rem;
}

.n-aside__header-link {
  display: flex;
  justify-content: flex-start;
  align-items: center;

  width: 100%;

  color: var(--n-ref-palette-white);
  font-weight: var(--n-sys-font-weight-bold);
  font-size: 2rem;
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
}

.n-aside__header-link-icon {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;

  width: 54px;
  height: 54px;
  padding: calc((54px - 32px) / 2);
}

.n-aside__header-link-icon svg {
  display: block;

  width: 100%;
  height: 100%;
}

.n-aside__header-link-text {
  opacity: 1;

  transition: opacity 0.3s;
}

.n-aside--close .n-aside__header-link-text {
  opacity: 0;

  transition: opacity 0.1s;
}

.n-aside__menu {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 12px;

  width: 100%;
  margin: 0;
  padding: 0;

  list-style: none;
}

.n-aside__footer {
  display: flex;
  justify-content: flex-end;

  padding: 1.5rem 1.5rem 0;
}

.n-aside__footer-toggle-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 30px;
  height: 30px;
}

.n-aside__footer-toggle {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 26px;
  height: 26px;
  margin: 0;
  padding: 0;

  color: var(--n-ref-palette-white);

  border: 0;
  border-radius: 4px;

  background-color: var(--n-sys-color-secondary-400);

  cursor: pointer;
}
</style>
