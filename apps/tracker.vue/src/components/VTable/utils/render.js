export const hSlot = (slot, scope, otherwise) => (slot !== undefined ? slot(scope) || otherwise : otherwise)
