import { createPopper } from '@popperjs/core'
import { NOOP } from '@vue/shared'
import { isElement, isNil } from 'lodash-unified'
import { computed, inject, onBeforeUnmount, onMounted, provide, ref, unref, watch } from 'vue'

import { useNamespace, useZIndex } from '../../../hooks/index.js'
import { formItemContextKey, POPPER_CONTENT_INJECTION_KEY, POPPER_INJECTION_KEY } from '../../../tokens/index.js'
import { createComponent, hSlot } from '../../../utils/index.js'
import { NFocusTrap } from '../../focus-trap/index.js'
import { popperContentEmits, popperContentProps } from './popperContentProps.js'
import { buildPopperOptions, unwrapMeasurableEl } from './utils.js'

export const NPopperContent = createComponent({
  name: 'NPopperContent',
  props: popperContentProps,
  emits: popperContentEmits,
  setup(props, { slots, emit, expose }) {
    const { popperInstanceRef, contentRef, triggerRef, role } = inject(POPPER_INJECTION_KEY, null)
    const formItemContext = inject(formItemContextKey, null)
    const { nextZIndex } = useZIndex()
    const ns = useNamespace('popper')
    const popperContentRef = ref()
    const focusStartRef = ref('first')
    const arrowRef = ref()
    const arrowOffset = ref()

    provide(POPPER_CONTENT_INJECTION_KEY, {
      arrowRef,
      arrowOffset,
    })

    if (formItemContext && (formItemContext.addInputId || formItemContext.removeInputId)) {
      // disallow auto-id from inside popper content
      provide(formItemContextKey, {
        ...formItemContext,
        addInputId: NOOP,
        removeInputId: NOOP,
      })
    }

    const contentZIndex = ref(props.zIndex || nextZIndex())
    const trapped = ref(false)

    let triggerTargetAriaStopWatch

    const computedReference = computed(() => unwrapMeasurableEl(props.referenceEl) || unref(triggerRef))

    const contentStyle = computed(() => [{ zIndex: unref(contentZIndex) }, props.popperStyle])

    const contentClass = computed(() => [
      ns.b(),
      ns.is('pure', props.pure),
      ns.m(`effect-${props.effect}`),
      props.popperClass,
    ])

    const ariaModal = computed(() => (role && role.value === 'dialog' ? 'false' : undefined))

    const createPopperInstance = ({ referenceEl, popperContentEl, arrowEl }) => {
      const options = buildPopperOptions(props, {
        arrowEl,
        arrowOffset: unref(arrowOffset),
      })

      return createPopper(referenceEl, popperContentEl, options)
    }

    const updatePopper = (shouldUpdateZIndex = true) => {
      unref(popperInstanceRef)?.update()
      shouldUpdateZIndex && (contentZIndex.value = props.zIndex || nextZIndex())
    }

    const togglePopperAlive = () => {
      const monitorable = { name: 'eventListeners', enabled: props.visible }

      unref(popperInstanceRef)?.setOptions?.((options) => ({
        ...options,
        modifiers: [...(options.modifiers || []), monitorable],
      }))
      updatePopper(false)

      // TODO: Focus trap
      if (props.visible && props.focusOnShow) {
        trapped.value = true
      } else if (props.visible === false) {
        trapped.value = false
      }
    }

    const onAfterActivate = () => {
      emit('focus')
    }

    /**
     * @param {CustomEvent} event
     */
    const onAfterDeactivate = (event) => {
      if (event.detail?.focusReason !== 'pointer') {
        focusStartRef.value = 'first'
        emit('blur')
      }
    }

    /**
     * @param {FocusEvent} event
     */
    const onFocusInTrap = (event) => {
      if (props.visible && !trapped.value) {
        if (event.target) {
          // @ts-ignore
          focusStartRef.value = event.target
        }

        trapped.value = true
      }
    }

    /**
     * @param {CustomEvent} event
     */
    const onFocusoutPrevented = (event) => {
      if (!props.trapping) {
        if (event.detail.focusReason === 'pointer') {
          event.preventDefault()
        }

        trapped.value = false
      }
    }

    const onReleaseRequested = () => {
      trapped.value = false
      emit('close')
    }

    onMounted(() => {
      let updateHandle

      watch(
        computedReference,
        (referenceEl) => {
          updateHandle?.()
          const popperInstance = unref(popperInstanceRef)

          popperInstance?.destroy?.()

          if (referenceEl) {
            const popperContentEl = unref(popperContentRef)

            contentRef.value = popperContentEl

            popperInstanceRef.value = createPopperInstance({
              referenceEl,
              popperContentEl,
              arrowEl: unref(arrowRef),
            })

            updateHandle = watch(
              () => referenceEl.getBoundingClientRect(),
              () => updatePopper(),
              {
                immediate: true,
              },
            )
          } else {
            popperInstanceRef.value = undefined
          }
        },
        {
          immediate: true,
        },
      )

      watch(
        () => props.triggerTargetEl,
        (triggerTargetEl, prevTriggerTargetEl) => {
          triggerTargetAriaStopWatch?.()
          triggerTargetAriaStopWatch = undefined

          const el = unref(triggerTargetEl || popperContentRef.value)
          const prevEl = unref(prevTriggerTargetEl || popperContentRef.value)

          if (isElement(el)) {
            triggerTargetAriaStopWatch = watch(
              [role, () => props.ariaLabel, ariaModal, () => props.id],
              (watches) => {
                ;['role', 'aria-label', 'aria-modal', 'id'].forEach((key, idx) => {
                  isNil(watches[idx]) ? el.removeAttribute(key) : el.setAttribute(key, watches[idx])
                })
              },
              { immediate: true },
            )
          }

          if (prevEl !== el && isElement(prevEl)) {
            ;['role', 'aria-label', 'aria-modal', 'id'].forEach((key) => {
              prevEl.removeAttribute(key)
            })
          }
        },
        { immediate: true },
      )

      watch(() => props.visible, togglePopperAlive, { immediate: true })

      watch(
        () =>
          buildPopperOptions(props, {
            arrowEl: unref(arrowRef),
            arrowOffset: unref(arrowOffset),
          }),
        (option) => popperInstanceRef.value?.setOptions(option),
      )
    })

    onBeforeUnmount(() => {
      triggerTargetAriaStopWatch?.()
      triggerTargetAriaStopWatch = undefined
    })

    expose({
      /**
       * @description popper content element
       */
      popperContentRef,
      /**
       * @description popperjs instance
       */
      popperInstanceRef,
      /**
       * @description method for updating popper
       */
      updatePopper,

      /**
       * @description content style
       */
      contentStyle,
    })

    // TODO: focus-trap
    // Возврат фокуса при закрытии
    return () => (
      <div
        ref={popperContentRef}
        style={contentStyle.value}
        class={contentClass.value}
        tabindex="-1"
        onMouseenter={(evt) => {
          emit('mouseenter', evt)
        }}
        onMouseleave={(evt) => {
          emit('mouseleave', evt)
        }}
      >
        <NFocusTrap
          trapped={trapped.value}
          trap-on-focus-in={true}
          focus-trap-el={popperContentRef.value}
          focus-start-el={focusStartRef.value}
          onAfterActivate={onAfterActivate}
          onAfterDeactivate={onAfterDeactivate}
          onFocusin={onFocusInTrap}
          onFocusoutPrevented={onFocusoutPrevented}
          onEscape={onReleaseRequested}
        >
          {hSlot(slots.default)}
        </NFocusTrap>
      </div>
    )
  },
})
