/*
 * Inspired by RouterLink from Vue Router
 *  --> API should match!
 */

import { computed, getCurrentInstance } from 'vue'

function prevent(e) {
  // eslint-disable-next-line no-unused-expressions
  e.cancelable !== false && e.preventDefault()
}

export const useRouterLinkProps = {
  // router-link
  /**
   * 1) Определите атрибут собственного типа кнопки (submit, reset, button) или
   * 2) компонент рендеринга с тегом <a>, чтобы вы могли получить доступ к событиям, даже если они отключены или
   * 3) Используйте реквизит 'href' и укажите 'type' в качестве медиа тега
   */
  replace: {
    type: Boolean,
    default: false,
  },
  disable: {
    type: Boolean,
    default: false,
  },

  // router-link
  /**
   * Эквивалентно свойству Vue Router <router-link> 'to';
   * Заменяется реквизитом 'href' при использовании
   */
  to: {
    type: [String, Object],
    default: null,
  },
  /**
   * Эквивалентен Vue Router <router-link> свойство 'replace';
   * Заменяется реквизитом 'href' при использовании
   */
  activeClass: {
    type: String,
    default: 'q-router-link--active',
  },
  exactActiveClass: {
    type: String,
    default: 'q-router-link--exact-active',
  },

  // regular <a> link
  /**
   * Собственный атрибут <a> ссылка href; Имеет приоритет над реквизитами «to» и «replace»
   */
  href: {
    type: String,
    default: null,
  },
  /**
   * Собственный <a> целевой атрибут ссылки; Используйте его только с реквизитом 'to' или 'href'
   */
  target: {
    type: String,
    default: null,
  },
}

export const useRouterLink = (fallbackTag) => {
  const { props, proxy } = getCurrentInstance()
  const hasHrefLink = computed(() => props.disable !== true && props.href !== null)

  const hasRouterLinkProps = computed(
    () =>
      props.disable !== true && hasHrefLink.value !== true && props.to !== null && props.to !== null && props.to !== '',
  )
  const linkRoute = computed(() => {
    if (hasRouterLinkProps.value === true) {
      try {
        return proxy.$router.resolve(props.to)
      } catch (error) {
        console.warn(error)
      }
    }

    return null
  })

  const hasRouterLink = computed(() => linkRoute.value !== null)
  const hasLink = computed(() => hasHrefLink.value === true || hasRouterLink.value === true)
  const linkTag = computed(() =>
    props.type === 'a' || hasLink.value === true ? 'a' : props.tag || fallbackTag || 'div',
  )
  // eslint-disable-next-line no-nested-ternary
  const linkProps = computed(() =>
    hasHrefLink.value === true
      ? {
          href: props.href,
          target: props.target,
        }
      : hasRouterLink.value === true
      ? {
          href: linkRoute.value.href,
          target: props.target,
        }
      : {},
  )

  // should match RouterLink from Vue Router
  function navigateToRouterLink(e) {
    if (
      // компонент не отключен
      props.disable === true ||
      // не перенаправлять с помощью клавиш управления
      e.metaKey ||
      e.altKey ||
      e.ctrlKey ||
      e.shiftKey ||
      // не перенаправлять при вызове preventDefault
      // ...если только не вызвать go() из @click(e, go)
      // eslint-disable-next-line no-underscore-dangle
      (e.__qNavigate !== true && e.defaultPrevented === true) ||
      // не перенаправлять при щелчке правой кнопкой мыши
      (e.button !== undefined && e.button !== 0) ||
      // не перенаправляйте, если он должен открыться в новом окне
      props.target === '_blank'
    ) {
      return false
    }

    prevent(e)

    return proxy.$router[props.replace === true ? 'replace' : 'push'](props.to).catch((error) => error)
  }

  return {
    hasRouterLink,
    hasLink,
    linkTag,
    linkProps,
    navigateToRouterLink,
  }
}
