import type {
  Component,
  ComponentInternalInstance,
  Ref,
  SetupContext,
  VNode,
  h,
} from "vue";
import type { Node } from "./model/Node";
// import type { Node } from "./model/Node";
import type { TreeStore } from "./model/TreeStore";

export interface RootTreeType {
  ctx: SetupContext<any>;
  props: TreeComponentProps;
  store: Ref<TreeStore>;
  root: Ref<Node>;
  currentNode: Ref<Node>;
  instance: ComponentInternalInstance;
}

export type hType = typeof h;
export type TreeData = TreeNodeData[];
export type TreeKey = string | number;

export interface FakeNode {
  data: TreeNodeData;
}

export interface TreeNodeData {
  [key: string]: unknown;
}

export interface TreeNodeLoadedDefaultProps {
  checked?: boolean;
}

export interface TreeNodeChildState {
  all: boolean;
  none: boolean;
  allWithoutDisable: boolean;
  half: boolean;
}

export interface TreeNodeOptions {
  data: TreeNodeData | TreeData;
  store: TreeStore;
  parent?: Node;
}

export interface TreeStoreNodesMap {
  [key: string]: Node;
}

export interface TreeStoreOptions {
  key: TreeKey;
  data: TreeData;
  props: TreeOptionProps;
  currentNodeKey: TreeKey;
  defaultExpandedKeys: TreeKey[];
  autoExpandParent: boolean;
  defaultExpandAll: boolean;
}

export interface TreeOptionProps {
  children?: string;
  label?: string | ((data: TreeNodeData, node: Node) => string);
  disabled?: string | ((data: TreeNodeData, node: Node) => string);
  isLeaf?: string | ((data: TreeNodeData, node: Node) => boolean);
  class?: (
    data: TreeNodeData,
    node: Node
  ) => string | { [key: string]: boolean } | string;
}

export type RenderContentFunction = (
  h: hType,
  context: RenderContentContext
) => VNode | VNode[];

export interface RenderContentContext {
  _self: ComponentInternalInstance;
  node: Node;
  data: TreeNodeData;
  store: TreeStore;
}

export type AllowDragFunction = (node: Node) => boolean;

export type AllowDropType = "inner" | "prev" | "next";

export type AllowDropFunction = (
  draggingNode: Node,
  dropNode: Node,
  type: AllowDropType
) => boolean;

export interface TreeComponentProps {
  data: TreeData;
  emptyText: string;
  renderAfterExpand: boolean;
  nodeKey: string;
  checkStrictly: boolean;
  expandOnClickNode: boolean;
  defaultExpandAll: boolean;
  checkOnClickNode: boolean;
  checkDescendants: boolean;
  autoExpandParent: boolean;
  defaultCheckedKeys: TreeKey[];
  defaultExpandedKeys: TreeKey[];
  currentNodeKey: TreeKey;
  renderContent: RenderContentFunction;
  props: TreeOptionProps;
  highlightCurrent: boolean;
  accordion: boolean;
  indent: number;
  icon: string | Component;
}

export type NodeDropType = "before" | "after" | "inner" | "none";
