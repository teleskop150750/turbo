import { computed } from 'vue'

export const alignMap = {
  left: 'start',
  center: 'center',
  right: 'end',
  between: 'between',
  around: 'around',
  evenly: 'evenly',
  stretch: 'stretch',
}

export const alignValues = Object.keys(alignMap)

export const useAlignProps = {
  align: {
    type: String,
    validator: (v) => alignValues.includes(v),
    default: 'center',
  },
}

export default function f(props) {
  return computed(() => `v-btn--align-${alignMap[props.align]}`)
}
