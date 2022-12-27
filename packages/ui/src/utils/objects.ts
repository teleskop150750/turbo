import { get, set } from "lodash-es";
import type { Entries } from "type-fest";
import type { Arrayable } from ".";

export const keysOf = <T extends {}>(arr: T) =>
  Object.keys(arr) as Array<keyof T>;
export const entriesOf = <T extends {}>(arr: T) =>
  Object.entries(arr) as Entries<T>;
export { hasOwn } from "@vue/shared";

export const getProp = <T = any>(
  obj: Record<string, any>,
  path: Arrayable<string>,
  defaultValue?: any
): { value: T } => {
  return {
    get value() {
      return get(obj, path, defaultValue);
    },
    set value(val: any) {
      set(obj, path, val);
    },
  };
};
