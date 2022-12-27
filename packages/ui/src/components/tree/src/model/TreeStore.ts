import { getNodeKey } from "./util";

import type {
  TreeData,
  TreeKey,
  TreeNodeData,
  TreeOptionProps,
  TreeStoreNodesMap,
  TreeStoreOptions,
} from "../types";
import { type Nillable, isObject, isArray } from "../../../../utils";
import { Node } from "./Node";

export class TreeStore {
  currentNode: Nillable<Node>;
  currentNodeKey: Nillable<TreeKey>;
  nodesMap: TreeStoreNodesMap;
  root: Node;
  data: TreeData;
  key: TreeKey;
  defaultExpandedKeys: TreeKey[];
  autoExpandParent: boolean;
  defaultExpandAll: boolean;
  props: TreeOptionProps;

  public constructor(options: TreeStoreOptions) {
    this.nodesMap = {};
    this.key = options.key;
    this.data = options.data;
    this.props = options.props;
    this.currentNodeKey = options.currentNodeKey;
    this.defaultExpandedKeys = options.defaultExpandedKeys;
    this.autoExpandParent = options.autoExpandParent;
    this.defaultExpandAll = options.defaultExpandAll;

    this.root = new Node({
      data: this.data,
      store: this,
    });
  }

  public setData(newVal: TreeData): void {
    if (newVal !== this.root.data) {
      this.root.setData(newVal);
    } else {
      this.root.updateChildren();
    }
  }

  public getNode(data: TreeKey | TreeNodeData | Node): Nillable<Node> {
    if (data instanceof Node) {
      return data;
    }

    const key = isObject(data) ? getNodeKey(this.key, data) : data;

    return this.nodesMap[key] || undefined;
  }

  public insertBefore(
    data: TreeNodeData,
    refData: TreeKey | TreeNodeData
  ): void {
    const refNode = this.getNode(refData);
    refNode?.parent?.insertBefore({ data }, refNode);
  }

  public insertAfter(
    data: TreeNodeData,
    refData: TreeKey | TreeNodeData
  ): void {
    const refNode = this.getNode(refData);
    refNode?.parent?.insertAfter({ data }, refNode);
  }

  public remove(data: TreeNodeData | Node): void {
    const node = this.getNode(data);

    if (!node || !node.parent) {
      return;
    }

    if (node === this.currentNode) {
      this.currentNode = undefined;
    }

    node.parent.removeChild(node);
  }

  public append(
    data: TreeNodeData,
    parentData: TreeNodeData | TreeKey | Node
  ): void {
    const parentNode = parentData ? this.getNode(parentData) : this.root;

    if (!parentNode) {
      return;
    }

    parentNode.insertChild({ data });
  }

  public registerNode(node: Node): void {
    const key = this.key;

    if (!node || !node.data) {
      return;
    }

    if (!key) {
      this.nodesMap[node.id] = node;
      return;
    }

    if (node.key !== undefined) {
      this.nodesMap[node.key] = node;
    }
  }

  public deregisterNode(node: Node): void {
    const key = this.key;

    if (!key || !node || !node.data) {
      return;
    }

    node.childNodes.forEach((child) => {
      this.deregisterNode(child);
    });

    if (node.key !== undefined) {
      delete this.nodesMap[node.key];
    }
  }

  public updateChildren(key: TreeKey, data: TreeData): void {
    const node = this.nodesMap[key];

    if (!node) {
      return;
    }

    const childNodes = node.childNodes;

    for (let i = childNodes.length - 1; i >= 0; i--) {
      const child = childNodes[i];
      child.data && !isArray(child.data) && this.remove(child.data);
    }

    for (let i = 0, j = data.length; i < j; i++) {
      const child = data[i];
      node.data && !isArray(node.data) && this.append(child, node.data);
    }
  }

  public setDefaultExpandedKeys(keys: TreeKey[]) {
    keys = keys || [];

    this.defaultExpandedKeys = keys;

    keys.forEach((key) => {
      const node = this.getNode(key);

      if (node) {
        node.expand(undefined, this.autoExpandParent);
      }
    });
  }

  public getCurrentNode() {
    return this.currentNode;
  }

  public setCurrentNode(currentNode: Node): void {
    const prevCurrentNode = this.currentNode;

    if (prevCurrentNode) {
      prevCurrentNode.isCurrent = false;
    }

    this.currentNode = currentNode;
    this.currentNode.isCurrent = true;
  }

  public setUserCurrentNode(node: Node, shouldAutoExpandParent = true): void {
    const key = (node as unknown as Record<string, string>)[this.key];
    const currNode = this.nodesMap[key];
    this.setCurrentNode(currNode);
    if (
      shouldAutoExpandParent &&
      this.currentNode &&
      this.currentNode.level > 1
    ) {
      this.currentNode.parent?.expand(undefined, true);
    }
  }

  public setCurrentNodeKey(key?: TreeKey, shouldAutoExpandParent = true): void {
    if (key === null || key === undefined) {
      this.currentNode && (this.currentNode.isCurrent = false);
      this.currentNode = undefined;
      return;
    }

    const node = this.getNode(key);

    if (node) {
      this.setCurrentNode(node);
      if (
        shouldAutoExpandParent &&
        this.currentNode &&
        this.currentNode.level > 1
      ) {
        this.currentNode.parent?.expand(undefined, true);
      }
    }
  }
}
