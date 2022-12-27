<script lang="ts">
import { defineComponent, h, inject, type PropType } from "vue";

import type { ComponentInternalInstance } from "vue";
import type { RootTreeType, TreeNodeData } from "./types";
import { useNamespace } from "src/hooks";

export default defineComponent({
  name: "NTreeNodeContent",
  props: {
    node: {
      type: Object as PropType<TreeNodeData>,
      required: true,
    },
    renderContent: Function,
  },
  setup(props) {
    const ns = useNamespace("tree");
    const nodeInstance = inject<ComponentInternalInstance>("NodeInstance");
    const tree = inject<RootTreeType>("RootTree")!;

    return () => {
      const node = props.node;
      const { data, store } = node;

      return props.renderContent
        ? props.renderContent(h, { _self: nodeInstance, node, data, store })
        : tree.ctx.slots.default
        ? tree.ctx.slots.default({ node, data })
        : h("span", { class: ns.be("node", "label") }, [node.label]);
    };
  },
});
</script>
