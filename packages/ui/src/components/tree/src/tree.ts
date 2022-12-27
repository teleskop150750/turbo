import type { ExtractPropTypes, PropType } from "vue";
import type { TreeComponentProps, TreeData, TreeKey } from "./types";
import type tree from "./NTree.vue";

export const treeProps = {
  data: {
    type: Array as PropType<TreeData>,
    default: () => [],
  },
  emptyText: {
    type: String,
  },
  renderAfterExpand: {
    type: Boolean,
    default: true,
  },
  nodeKey: {
    type: [String, Number] as PropType<TreeKey>,
    required: true,
  },
  defaultExpandAll: {
    type: Boolean,
    default: false,
  },
  expandOnClickNode: {
    type: Boolean,
    default: true,
  },
  autoExpandParent: {
    type: Boolean,
    default: true,
  },
  defaultExpandedKeys: {
    type: Array as PropType<TreeComponentProps["defaultExpandedKeys"]>,
    default: () => [],
  },
  currentNodeKey: {
    type: [String, Number] as PropType<string | number>,
  },
  renderContent: Function,
  props: {
    type: Object as PropType<TreeComponentProps["props"]>,
    default: () => ({
      children: "children",
      label: "label",
      disabled: "disabled",
    }),
  },
  highlightCurrent: Boolean,
  accordion: {
    type: Boolean,
    default: false,
  },
  indent: {
    type: Number,
    default: 18,
  },
} as const;

export type NTreeProps = ExtractPropTypes<typeof treeProps>;
export type NTreeInstance = InstanceType<typeof tree>;
