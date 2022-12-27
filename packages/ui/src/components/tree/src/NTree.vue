<script lang="ts" setup>
import { useLocale, useNamespace } from "../../../hooks";
import type { Nillable } from "../../../utils";
import { ref } from "vue";
import { TreeStore } from "./model/TreeStore";
import { treeProps } from "./tree";

const props = defineProps(treeProps);
const { t } = useLocale();
const ns = useNamespace("tree");

const currentNode = ref<Nillable<HTMLElement>>(undefined);
const rootRef = ref<Nillable<HTMLElement>>(undefined);

const store = ref<TreeStore>(
  new TreeStore({
    key: props.nodeKey,
    data: props.data,
    props: props.props,
    currentNodeKey: props.currentNodeKey,
    defaultExpandedKeys: props.defaultExpandedKeys,
    autoExpandParent: props.autoExpandParent,
    defaultExpandAll: props.defaultExpandAll,
  })
);
</script>

<template>
  <div ref="rootRef" :class="[ns.b()]" role="tree"></div>
</template>
