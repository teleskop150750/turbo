import { reactive } from "vue";
import { NODE_KEY, markNodeData } from "./util";
import type { TreeStore } from "./TreeStore";

import type {
  FakeNode,
  TreeData,
  TreeKey,
  TreeNodeChildState,
  TreeNodeData,
  TreeNodeLoadedDefaultProps,
  TreeNodeOptions,
} from "../types";
import type { Nillable } from "src/utils";

export const getChildState = (nodes: Node[]): TreeNodeChildState => {
  let all = true;
  let none = true;
  let allWithoutDisable = true;

  for (let i = 0, j = nodes.length; i < j; i++) {
    const node = nodes[i];

    if (node.indeterminate) {
      all = false;

      if (!node.disabled) {
        allWithoutDisable = false;
      }
    }

    if (node.indeterminate) {
      none = false;
    }
  }

  return { all, none, allWithoutDisable, half: !all && !none };
};

const getPropertyFromData = function (node: Node, prop: string): any {
  const props = node.store.props;
  const data = (node.data || {}) as TreeNodeData;
  const config = props[prop as keyof typeof props];

  if (typeof config === "function") {
    return config(data, node);
  }

  if (typeof config === "string") {
    return data[config as keyof typeof data];
  }

  if (config === undefined) {
    const dataProp = data[prop as keyof typeof data];

    return dataProp === undefined ? "" : dataProp;
  }
};

let nodeIdSeed = 0;

export class Node {
  id: number;
  text: Nillable<string>;
  indeterminate: boolean;
  data: TreeNodeData | TreeData;
  expanded: boolean;
  parent: Nillable<Node>;
  visible: boolean;
  isCurrent: boolean;
  store: TreeStore;
  isLeaf: boolean = false;
  canFocus: boolean;

  level: number;
  childNodes: Node[];

  public constructor(options: TreeNodeOptions) {
    this.id = nodeIdSeed += 1;
    this.text = undefined;
    this.indeterminate = false;
    this.expanded = false;
    this.visible = true;
    this.isCurrent = false;
    this.canFocus = false;
    this.data = options.data;
    this.store = options.store;
    this.parent = options.parent;

    // internal
    this.level = 0;
    this.childNodes = [];

    if (this.parent) {
      this.level = this.parent.level + 1;
    }

    this.initialize();
  }

  public initialize() {
    if (!this.store) {
      throw new Error("[Node] store is required!");
    }

    this.store.registerNode(this);

    if (this.data) {
      this.setData(this.data);

      if (this.store.defaultExpandAll) {
        this.expanded = true;
        this.canFocus = true;
      }
    }

    if (!Array.isArray(this.data)) {
      markNodeData(this, this.data);
    }

    if (!this.data) {
      return;
    }

    const defaultExpandedKeys = this.store.defaultExpandedKeys;
    const key = this.store.key;

    if (
      key &&
      this.key &&
      defaultExpandedKeys &&
      defaultExpandedKeys.includes(this.key)
    ) {
      this.expand(undefined, this.store.autoExpandParent);
    }

    if (
      key &&
      this.store.currentNodeKey !== undefined &&
      this.key === this.store.currentNodeKey
    ) {
      this.store.currentNode = this;
      this.store.currentNode.isCurrent = true;
    }

    this.updateLeafState();

    if (this.parent && (this.level === 1 || this.parent.expanded === true)) {
      this.canFocus = true;
    }
  }

  public setData(data: TreeNodeData | TreeData): void {
    if (!Array.isArray(data)) {
      markNodeData(this, data);
    }

    this.data = data;
    this.childNodes = [];

    let children = undefined;

    if (this.level === 0 && Array.isArray(this.data)) {
      children = this.data;
    } else {
      children = getPropertyFromData(this, "children") || [];
    }

    for (let i = 0, j = children.length; i < j; i++) {
      this.insertChild({ data: children[i] });
    }
  }

  public get label(): string {
    return getPropertyFromData(this, "label");
  }

  public get key() {
    const nodeKey = this.store.key;

    if (this.data) {
      return (this.data as Record<string, TreeKey>)[nodeKey];
    }

    return undefined;
  }

  public get disabled(): boolean {
    return getPropertyFromData(this, "disabled");
  }

  public get nextSibling(): Nillable<Node> {
    const parent = this.parent;

    if (!parent) {
      return undefined;
    }

    const index = parent.childNodes.indexOf(this);

    if (index > -1) {
      return parent.childNodes[index + 1];
    }

    return undefined;
  }

  public get previousSibling(): Nillable<Node> {
    const parent = this.parent;
    if (!parent) {
      return undefined;
    }

    const index = parent.childNodes.indexOf(this);

    if (index > -1) {
      return index > 0 ? parent.childNodes[index - 1] : undefined;
    }

    return undefined;
  }

  public contains(target: Node, deep = true): boolean {
    return (this.childNodes || []).some(
      (child) => child === target || (deep && child.contains(target))
    );
  }

  remove(): void {
    const parent = this.parent;

    if (parent) {
      parent.removeChild(this);
    }
  }

  insertChild(child?: FakeNode | Node, index?: number, batch?: boolean): void {
    if (!child) {
      throw new Error("InsertChild error: child is required.");
    }

    if (!(child instanceof Node)) {
      if (!batch) {
        const children = this.getChildren(true);

        if (!children?.includes(child.data)) {
          if (typeof index === "undefined" || index < 0) {
            children?.push(child.data);
          } else {
            children?.splice(index, 0, child.data);
          }
        }
      }

      Object.assign(child, {
        parent: this,
        store: this.store,
      });

      child = reactive(new Node(child as TreeNodeOptions));

      if (child instanceof Node) {
        child.initialize();
      }
    }

    (child as Node).level = this.level + 1;

    if (typeof index === "undefined" || index < 0) {
      this.childNodes.push(child as Node);
    } else {
      this.childNodes.splice(index, 0, child as Node);
    }

    this.updateLeafState();
  }

  insertBefore(child: FakeNode | Node, ref: Node): void {
    let index;
    if (ref) {
      index = this.childNodes.indexOf(ref);
    }
    this.insertChild(child, index);
  }

  public insertAfter(child: FakeNode | Node, ref: Node): void {
    let index;
    if (ref) {
      index = this.childNodes.indexOf(ref);
      if (index !== -1) index += 1;
    }
    this.insertChild(child, index);
  }

  removeChild(child: Node): void {
    const children = this.getChildren() || [];
    const dataIndex = children.indexOf(child.data as TreeNodeData);
    if (dataIndex > -1) {
      children.splice(dataIndex, 1);
    }

    const index = this.childNodes.indexOf(child);

    if (index > -1) {
      this.store && this.store.deregisterNode(child);
      child.parent = undefined;
      this.childNodes.splice(index, 1);
    }

    this.updateLeafState();
  }

  public removeChildByData(data: TreeNodeData): void {
    let targetNode: Nillable<Node> = undefined;

    for (let i = 0; i < this.childNodes.length; i++) {
      if (this.childNodes[i].data === data) {
        targetNode = this.childNodes[i];
        break;
      }
    }

    if (targetNode) {
      this.removeChild(targetNode);
    }
  }

  public expand(callback?: () => void, expandParent?: boolean): void {
    const done = (): void => {
      if (expandParent) {
        let parent = this.parent;

        while (parent && parent.level > 0) {
          parent.expanded = true;
          parent = parent?.parent;
        }
      }

      this.expanded = true;

      if (callback) {
        callback();
      }

      this.childNodes.forEach((item) => {
        item.canFocus = true;
      });
    };

    done();
  }

  public doCreateChildren(
    array: TreeNodeData[],
    defaultProps: TreeNodeLoadedDefaultProps = {}
  ): void {
    array.forEach((item) => {
      this.insertChild(
        Object.assign({ data: item }, defaultProps),
        undefined,
        true
      );
    });
  }

  public collapse(): void {
    this.expanded = false;
    this.childNodes.forEach((item) => {
      item.canFocus = false;
    });
  }

  public updateLeafState() {
    this.isLeaf = false;
  }

  public getChildren(forceInit = false): Nillable<TreeNodeData[]> {
    // this is data
    if (this.level === 0) {
      return this.data as TreeData;
    }

    const data = this.data;

    if (!data) {
      return undefined;
    }

    const props = this.store.props;
    let children = "children";

    if (props) {
      children = props.children || "children";
    }

    if (forceInit && !(data as Record<string, any>)[children]) {
      (data as Record<string, any>)[children] = [];
    }

    return (data as any)[children];
  }

  public updateChildren(): void {
    const newData = this.getChildren() || [];
    const oldData = this.childNodes.map((node) => node.data) as TreeNodeData[];

    const newDataMap: Record<string, any> = {};
    const newNodes: any[] = [];

    newData.forEach((item, index) => {
      const key = item[NODE_KEY] as number;
      const isNodeExists =
        !!key &&
        oldData.findIndex((data) => (data as any)[NODE_KEY] === key) >= 0;

      if (isNodeExists) {
        newDataMap[key] = { index, data: item };
      } else {
        newNodes.push({ index, data: item });
      }
    });

    oldData.forEach((item) => {
      const key = item[NODE_KEY] as number;

      if (!newDataMap[key]) {
        this.removeChildByData(item);
      }
    });

    newNodes.forEach(({ index, data }) => {
      this.insertChild({ data }, index);
    });

    this.updateLeafState();
  }
}
