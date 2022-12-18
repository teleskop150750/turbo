import type { ExtractPropTypes } from "vue";
import type NButton from "./NButton.vue";

export const buttonProps = {
  label: {
    type: String,
    default: "",
  },
} as const;

export type NButtonProps = ExtractPropTypes<typeof buttonProps>;
export type NButtonInstance = InstanceType<typeof NButton>;
