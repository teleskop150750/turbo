import { computed } from 'vue'

import useAlign, { useAlignProps } from './useAlign.js'
import { useRouterLink, useRouterLinkProps } from './useRouterLink.js'

const formTypes = new Set(['button', 'submit', 'reset'])
const mediaTypeRE = /\S\/\S/

const defaultSizes = {
  xs: 8,
  sm: 12,
  md: 14,
  lg: 20,
  xl: 24,
}

export const useButtonProps = {
  ...useRouterLinkProps,

  type: {
    type: String,
    default: 'button',
  },

  /**
   * Текст, который будет отображаться на кнопке
   */
  label: {
    type: [Number, String],
    default: null,
  },
  icon: {
    type: [String, Object],
    default: null,
  },
  iconRight: {
    type: [String, Object],
    default: null,
  },

  /**
   * «контурный» дизайн
   */
  outline: {
    type: Boolean,
    default: false,
  },
  /**
   *  «плоский» дизайн
   */
  flat: {
    type: Boolean,
    default: false,
  },
  /**
   * округлый
   */
  rounded: {
    type: Boolean,
    default: false,
  },
  /**
   * Создает кнопку в форме круга
   */
  round: {
    type: Boolean,
    default: false,
  },

  /**
   * Плотный режим; занимает меньше места
   */
  dense: {
    type: Boolean,
    default: false,
  },

  /**
   * Размер
   */
  size: {
    type: String,
    default: null,
  },

  noWrap: {
    type: Boolean,
    default: true,
  },

  tabindex: {
    type: [Number, String],
    default: null,
  },

  /**
   * Выравнивание меток или содержимого
   */

  align: {
    ...useAlignProps.align,
    default: 'center',
  },
  /**
   * Во всю ширину
   */
  full: {
    type: Boolean,
    default: false,
  },
  /**
   * Перевести кнопку в состояние загрузки (отображает VSpinner -- может быть переопределен с помощью слота 'loading')
   */
  loading: {
    type: Boolean,
    default: null,
  },
  /**
   * Перевод компонента в отключенный режим
   */
  disable: {
    type: Boolean,
    default: false,
  },
}

export const useButton = (props) => {
  const alignClass = useAlign(props)
  const { hasRouterLink, hasLink, linkTag, linkProps, navigateToRouterLink } = useRouterLink('button')

  const style = computed(() => {
    // eslint-disable-next-line no-nested-ternary
    const fontSize =
      props.size !== null ? (props.size in defaultSizes ? `${defaultSizes[props.size]}px` : props.size) : null

    return { fontSize }
  })

  const isRounded = computed(() => props.rounded === true)
  const isActionable = computed(() => props.disable !== true && props.loading !== true)
  const tabIndex = computed(() => (isActionable.value === true ? props.tabindex || 0 : -1))
  const design = computed(() => {
    if (props.flat === true) {
      return 'flat'
    }

    if (props.outline === true) {
      return 'outline'
    }

    return 'standard'
  })

  const attributes = computed(() => {
    const accumulator = { tabindex: tabIndex.value }

    if (hasLink.value === true) {
      Object.assign(accumulator, linkProps.value)
    } else if (formTypes.has(props.type) === true) {
      accumulator.type = props.type
    }

    if (linkTag.value === 'a') {
      if (props.disable === true) {
        accumulator['aria-disabled'] = 'true'
      } else if (accumulator.href === null) {
        accumulator.role = 'button'
      }

      if (hasRouterLink.value !== true && mediaTypeRE.test(props.type) === true) {
        accumulator.type = props.type
      }
    } else if (props.disable === true) {
      accumulator.disabled = ''
      accumulator['aria-disabled'] = 'true'
    }

    return accumulator
  })

  const classes = computed(() => {
    let accumulator = [`v-btn--${design.value}`]

    accumulator.push(alignClass.value)

    if (props.round === true) {
      accumulator.push('v-btn--round')
    }

    if (isRounded.value === true) {
      accumulator.push('v-btn--rounded')
    }

    if (isActionable.value === true) {
      accumulator = [...accumulator, 'v-btn--actionable', 'v-btn--focusable', 'v-btn--hoverable']
    } else if (props.disable === true) {
      accumulator.push('disabled')
    }

    if (props.dense === true) {
      accumulator.push('v-btn--dense')
    }

    if (props.full === true) {
      accumulator.push('v-btn--full')
    }

    if (props.disable === true) {
      accumulator.push('v-btn--disable')
    }

    return accumulator.join(' ')
  })

  const innerClasses = computed(
    () =>
      (props.noWrap === true ? ' v-btn__content--no-wrap' : '') +
      (props.loading === true ? ' v-btn__content--hidden' : ''),
  )

  return {
    classes,
    style,
    innerClasses,
    attributes,
    hasRouterLink,
    linkTag,
    navigateToRouterLink,
    isActionable,
  }
}
