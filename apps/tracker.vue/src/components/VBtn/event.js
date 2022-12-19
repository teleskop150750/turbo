/* eslint-disable no-unused-expressions */
export const listenOpts = {
  hasPassive: false,
  passiveCapture: true,
  notPassiveCapture: true,
}

export function stop(e) {
  e.stopPropagation()
}

export function prevent(e) {
  e.cancelable !== false && e.preventDefault()
}
export function stopAndPrevent(e) {
  e.cancelable !== false && e.preventDefault()
  e.stopPropagation()
}

export function isKeyCode(event_, keyCodes) {
  return [keyCodes].flat().includes(event_.keyCode)
}
