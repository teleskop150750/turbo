<script>
import { isObject } from '@vue/shared'
import { computed, h, onBeforeUnmount, ref, Transition, useSlots } from 'vue'

import VSpinner from '../VSpinner/VSpinner.vue'
import { isKeyCode, listenOpts as listenOptions, prevent, stop, stopAndPrevent } from './event.js'
import { useButton, useButtonProps } from './useButton.js'

export default {
  props: { ...useButtonProps },
  emits: ['click', 'keydown', 'pointerdown', 'keyup'],
  setup(props, { expose, emit }) {
    const { passiveCapture } = listenOptions

    let pointerTarget = null
    let keyboardTarget = null

    const { classes, style, innerClasses, attributes, hasRouterLink, linkTag, navigateToRouterLink, isActionable } =
      useButton(props)

    const rootReference = ref(null)
    const blurTargetReference = ref(null)

    let localPointerTargetElement = null

    const hasLabel = computed(() => props.label !== null && props.label !== '')

    const onEvents = computed(() => {
      if (props.loading === true) {
        return {
          onPointerdown: onLoadingEvent,
          onClick: onLoadingEvent,
          onKeydown: onLoadingEvent,
          onKeyup: onLoadingEvent,
        }
      }

      if (isActionable.value === true) {
        return {
          onClick,
          onKeydown,
          onPointerdown,
        }
      }

      return {
        // необходимо; особенно для отключенных тегов <a>
        onClick: stopAndPrevent,
      }
    })

    const nodeProps = computed(() => ({
      ref: rootReference,
      class: `v-btn ${classes.value}`,
      style: style.value,
      ...attributes.value,
      ...onEvents.value,
    }))

    function onClick(event) {
      // он уже уничтожен?
      if (rootReference.value === null) {
        return
      }

      if (event !== undefined) {
        if (event.defaultPrevented === true) {
          return
        }

        const element = document.activeElement

        // кнопка фокусировки, если она была получена из формы ВВОДА
        // предотвратить новую отправку (уже отправлено)
        if (
          props.type === 'submit' &&
          element !== document.body &&
          rootReference.value.contains(element) === false &&
          // требуется для iOS и настольного Safari
          element.contains(rootReference.value) === false
        ) {
          rootReference.value.focus()

          const onClickCleanup = () => {
            document.removeEventListener('keydown', stopAndPrevent, true)
            document.removeEventListener('keyup', onClickCleanup, passiveCapture)
            rootReference.value !== null &&
              rootReference.value.removeEventListener('blur', onClickCleanup, passiveCapture)
          }

          document.addEventListener('keydown', stopAndPrevent, true)
          document.addEventListener('keyup', onClickCleanup, passiveCapture)
          rootReference.value.addEventListener('blur', onClickCleanup, passiveCapture)
        }
      }

      if (hasRouterLink.value === true) {
        const go = () => {
          // eslint-disable-next-line no-underscore-dangle
          event.__qNavigate = true
          navigateToRouterLink(event)
        }

        emit('click', event, go)
        // eslint-disable-next-line no-underscore-dangle
        event.defaultPrevented !== true && go()
      } else {
        emit('click', event)
      }
    }

    function onKeydown(event) {
      // он уже уничтожен?
      if (rootReference.value === null) {
        return
      }

      emit('keydown', event)

      if (event.defaultPrevented === true) {
        return
      }

      if (isKeyCode(event, [13, 32]) === true && keyboardTarget !== rootReference.value) {
        keyboardTarget !== null && cleanup()

        // фокус внешней кнопки, если хелпер фокуса был сфокусирован до этого
        rootReference.value.focus()

        keyboardTarget = rootReference.value
        rootReference.value.classList.add('v-btn--active')
        document.addEventListener('keyup', onPressEnd, true)
        rootReference.value.addEventListener('blur', onPressEnd, passiveCapture)

        stopAndPrevent(event)
      }
    }

    function onPointerdown(event) {
      // он уже уничтожен?
      if (rootReference.value === null) {
        return
      }

      emit('pointerdown', event)

      if (event.defaultPrevented === true) {
        return
      }

      if (pointerTarget !== rootReference.value) {
        pointerTarget !== null && cleanup()
        pointerTarget = rootReference.value

        localPointerTargetElement = event.target
        rootReference.value.classList.add('v-btn--active')
        localPointerTargetElement.addEventListener('pointercancel', onPressEnd, passiveCapture)
        localPointerTargetElement.addEventListener('pointerup', onPressEnd, passiveCapture)
      }
    }

    function onPressEnd(event) {
      // он уже уничтожен?
      if (rootReference.value === null) {
        return
      }

      if (event !== undefined && event.type === 'keyup') {
        if (keyboardTarget === rootReference.value && isKeyCode(event, [13, 32]) === true) {
          // для триггера клика)
          const event_ = new MouseEvent('click', event)

          event_.qKeyEvent = true
          event.defaultPrevented === true && prevent(event_)
          event.cancelBubble === true && stop(event_)
          rootReference.value.dispatchEvent(event_)

          stopAndPrevent(event)
        }

        emit('keyup', event)
      }

      cleanup()
    }

    function cleanup(destroying) {
      const blurTarget = blurTargetReference.value

      if (
        destroying !== true &&
        pointerTarget === rootReference.value &&
        blurTarget !== null &&
        blurTarget !== document.activeElement
      ) {
        blurTarget.setAttribute('tabindex', -1)
        blurTarget.focus()
      }

      if (pointerTarget === rootReference.value) {
        if (localPointerTargetElement !== null) {
          localPointerTargetElement.removeEventListener('pointercancel', onPressEnd, passiveCapture)
          localPointerTargetElement.removeEventListener('pointerup', onPressEnd, passiveCapture)
          localPointerTargetElement = null
        }

        pointerTarget = null
      }

      if (keyboardTarget === rootReference.value) {
        document.removeEventListener('keyup', onPressEnd, true)
        rootReference.value !== null && rootReference.value.removeEventListener('blur', onPressEnd, passiveCapture)
        keyboardTarget = null
      }

      rootReference.value !== null && rootReference.value.classList.remove('v-btn--active')
    }

    function onLoadingEvent(event) {
      stopAndPrevent(event)
      event.qSkipRipple = true
    }

    onBeforeUnmount(() => {
      cleanup(true)
    })

    // expose public methods
    expose({ click: onClick, ref: rootReference })

    return () => {
      const slots = useSlots()

      function hMergeSlot(slot, source) {
        return slot !== undefined ? [...source, ...slot()] : source
      }

      let inner = []

      if (props.icon) {
        if (isObject(props.icon)) {
          inner.push(h(props.icon, { class: ['v-btn__icon', hasLabel.value && 'v-btn__icon--left'] }))
        } else {
          inner.push(props.icon)
        }
      }

      hasLabel.value === true && inner.push(h('span', { class: 'v-btn__label' }, [props.label]))

      inner = hMergeSlot(slots.default, inner)

      if (props.iconRight !== null && props.round === false) {
        if (isObject(props.iconRight)) {
          inner.push(h(props.iconRight, { class: ['v-btn__icon', hasLabel.value && 'v-btn__icon--right'] }))
        } else {
          inner.push(props.iconRight)
        }
      }

      const child = [
        h('span', {
          class: 'v-btn__focus-helper',
          ref: blurTargetReference,
        }),
      ]

      child.push(h('span', { class: `v-btn__content v-anchor--skip ${innerClasses.value}` }, inner))

      props.loading !== null &&
        child.push(
          h(Transition, { name: 'v-transition--fade' }, () =>
            props.loading === true
              ? [
                  h(
                    'span',
                    {
                      key: 'loading',
                      class: 'v-btn__loader-wrapper',
                    },
                    slots.loading !== undefined ? slots.loading() : [h(VSpinner)],
                  ),
                ]
              : null,
          ),
        )

      return h(linkTag.value, nodeProps.value, child)
    }
  },
}
</script>

<style>
.v-btn {
  --v-button-text-color: var(--el-color-white);
  --v-button-bg-color: var(--el-color-primary);

  position: relative;

  display: inline-flex;
  flex-direction: column;
  align-items: stretch;

  width: auto;
  height: auto;
  min-height: 32px;
  padding: 4px 16px;

  color: inherit;
  color: var(--v-button-text-color);
  font-weight: 500;
  font-size: 14px;
  line-height: 1.715em;
  text-align: center;
  text-decoration: none;
  vertical-align: middle;

  border: 0;
  border-radius: 3px;

  background-color: var(--v-button-bg-color);

  outline: 0;

  cursor: default;

  user-select: none;
}

.v-btn:focus-visible .v-btn:focus {
  overflow: none;
}

.v-btn .v-icon,
.v-btn .v-spinner {
  font-size: 1.715em;
}

.v-btn--disable {
  opacity: 0.7 !important;
}

.v-btn::before {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  content: '';

  display: block;

  border-radius: inherit;

  box-shadow: 0 1px 5px rgb(0 0 0 / 20%), 0 2px 2px rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%);
}

.v-btn--actionable {
  cursor: pointer;
}

.v-btn--actionable.v-btn--standard::before {
  transition: box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.v-btn--actionable.v-btn--standard:active::before,
.v-btn--actionable.v-btn--standard.v-btn--active::before {
  box-shadow: 0 3px 5px -1px rgb(0 0 0 / 20%), 0 5px 8px rgb(0 0 0 / 14%), 0 1px 14px rgb(0 0 0 / 12%);
}

.v-btn--outline {
  --v-button-text-color: var(--el-color-primary);
  --v-button-bg-color: var(--el-color-white);

  background: transparent !important;
}

.v-btn--outline::before {
  border: 1px solid currentcolor;
}

.v-btn--rounded {
  border-radius: 28px;
}

.v-btn--round {
  min-width: 3em;
  min-height: 3em;
  padding: 0;

  border-radius: 50%;
}

.v-btn--square {
  border-radius: 0;
}

.v-btn--full {
  display: flex;

  width: 100%;
}

.v-btn--flat {
  --v-button-text-color: var(--el-color-primary);

  background: transparent;
}

.v-btn--flat::before,
.v-btn--outline::before,
.v-btn--unelevated::before {
  box-shadow: none;
}

.v-btn--dense {
  min-height: 2em;
  padding: 0.285em;
}

.v-btn--dense.v-btn--round {
  min-width: 2.4em;
  min-height: 2.4em;
  padding: 0;
}

.v-btn__focus-helper {
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  border-radius: inherit;

  opacity: 0;

  pointer-events: none;

  transition: background-color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1), opacity 0.4s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.v-btn--focusable:focus > .v-btn__focus-helper,
.v-btn--hoverable:hover > .v-btn__focus-helper {
  background: currentcolor;

  opacity: 0.15;
}

.v-btn__content {
  z-index: 0;

  display: flex;
  flex: 10000 1 0%;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;

  text-align: center;

  transition: opacity 0.3s;
}

.v-btn--align-start .v-btn__content {
  justify-content: start;
}

.v-btn__content--hidden {
  opacity: 0;

  pointer-events: none;
}

.v-btn__content--no-wrap {
  flex-wrap: nowrap;

  white-space: nowrap;
}

.v-btn__icon--left {
  margin-right: 8px;
  margin-left: -6px;
}

.v-btn__icon--right {
  margin-right: -6px;
  margin-left: 8px;
}

.v-btn--dense .v-btn__icon--left {
  margin-right: 6px;
  margin-left: -4px;
}

.v-btn--dense .v-btn__icon--right {
  margin-right: -4px;
  margin-left: 6px;
}

.v-btn__label {
  display: block;
}

.v-btn__loader-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
