<script>
import { Plus } from '@element-plus/icons-vue'
import { ElButton } from 'element-plus'
import { computed, h, ref, useSlots } from 'vue'

import { useTable } from './useTable.js'
import { hSlot } from './utils/render.js'
// import VBtn from '../VBtn/VBtn.vue'
// import VCheckbox from '../VCheckbox/VCheckbox.vue'
// import VPlus from '../../icons/VPlusIcon.vue'

export default {
  props: {
    // canSelectRow: {
    //     type: Function,
    //     default: (row) => true,
    // },
    /**
     * Отступ
     */
    indentation: {
      type: Number,
      default: 14,
    },
    columns: {
      type: Array,
      default: () => [],
    },
    rows: {
      type: Array,
      default: () => [],
    },
    childrenField: {
      type: String,
      default: 'children',
    },
    rowKey: {
      type: [String, Function],
      default: 'id',
    },
    expandedKeys: {
      type: Object,
      default: () => ({}),
    },
    selected: {
      type: Array,
      default: () => [],
    },
  },
  emit: ['update:selected', 'selection'],

  setup(props, { emit }) {
    const {
      // selectableRows,
      computedRows,
      getRowKey,
      // select
      // allRowsSelected,
      // someRowsSelected,
      // isRowSelected,
      // updateSelection,
    } = useTable(props, emit)
    const expandedKeys = ref(props.expandedKeys)

    function onRowToggle(row) {
      const rowKey = getRowKey.value(row)

      if (expandedKeys.value[rowKey]) {
        delete expandedKeys.value[rowKey]
        emit('row-collapse', row)
      } else {
        expandedKeys.value[rowKey] = true
        emit('row-expand', row)
      }

      emit('update:expanded-keys', expandedKeys.value)
    }

    return () => {
      const slots = useSlots()

      const VTableBodyCell = ({ value, row, level, column, isLeaf }) => {
        const style = {}

        if (column.expander === true) {
          style['--v-table-cell-left-padding'] = `${level * 28}px`
        }

        const expander =
          column.expander === true && !isLeaf.value
            ? h(ElButton, {
                onClick() {
                  onRowToggle(row)
                },
                class: 'v-table__table-body-cell-expander',
                size: 'small',
                icon: Plus,
                circle: true,
              })
            : null

        const content = h(
          'div',
          { class: 'v-table__table-body-cell-content' },
          hSlot(
            slots[`body-cell-${column.field}`],
            {
              index: row._index,
              row,
              level,
              isLeaf,
            },
            value,
          ),
        )
        const inner = h('div', { class: 'v-table__table-body-cell-inner' }, [expander, content])

        return h('td', { class: 'v-table__table-body-cell', style }, inner)
      }

      const VTableBodyRow = (rowProps) => {
        const { row, level, childrenField, columns } = rowProps

        // eslint-disable-next-line no-shadow
        const createRow = ({ row, level }) => {
          const rowKey = getRowKey.value(row)
          const isExpanded = computed(() => expandedKeys.value[rowKey] === true)
          const isLeaf = computed(() =>
            row.leaf === false ? false : !(row[childrenField] && row[childrenField].length > 0),
          )

          const createChildrenRows = () => {
            if (!isExpanded.value || !row[childrenField] || row[childrenField].length === 0) {
              return null
            }

            // eslint-disable-next-line no-shadow
            return row[childrenField].map((row) => createRow({ row, level: level + 1 }))
          }

          const rowContent = columns.map((column) => {
            // eslint-disable-next-line no-shadow
            const getValue = typeof column.field === 'function' ? column.field : (row) => row[column.field]
            const value = getValue(row) ?? null

            return VTableBodyCell({
              value,
              row,
              level,
              column,
              isLeaf,
            })
          })

          // rowContent.unshift(VTableBodyCheckboxCell({ row, key: rowKey }))

          const children = createChildrenRows()

          return [
            h(
              'tr',
              {
                class: ['v-table__table-body-row', { 'v-table__table-body-row--leaf': isLeaf.value }],
                key: rowKey,
              },
              rowContent,
            ),
            children,
          ]
        }

        return createRow({ row, level })
      }

      // body
      const tbodyContent = computedRows.value.map((row) =>
        VTableBodyRow({
          row,
          level: 1,
          childrenField: props.childrenField,
          columns: props.columns,
        }),
      )

      const tbody = h('tbody', { class: 'v-table__table-body' }, tbodyContent)

      function getTHead() {
        const theadRowContent = props.columns.map((column) =>
          // @ts-ignore
          h('th', { class: 'v-table__table-head-cell', key: column.field }, column.text),
        )
        // theadRowContent.unshift(VTableHeadCheckboxCell())

        const theadContent = h('tr', { class: 'v-table__table-head-row' }, theadRowContent)

        return h('thead', { class: 'v-table__table-head' }, theadContent)
      }

      const table = h('table', { class: 'v-table__table' }, [getTHead(), tbody])
      const vTableBody = h('div', { class: 'v-table__body' }, table)

      return h('div', { class: 'v-table' }, vTableBody)
    }
  },
}
</script>

<style>
.v-table {
  position: relative;

  overflow: hidden;
}

.v-table--sticky-header-column tr th {
  position: sticky;
  z-index: 2;

  background: hsl(0deg 0% 100%);
}

.v-table--sticky-header-column td:first-child {
  position: sticky;
  left: 0;
  z-index: 1;

  background-color: hsl(134deg 70% 86%) !important;
}

.v-table--sticky-header-column th:first-child {
  position: sticky;
  left: 0;
}

.v-table--sticky-header-column thead tr:last-child th {
  top: 48px;
  z-index: 3;
}

.v-table--sticky-header-column thead tr:first-child th {
  top: 0;
  z-index: 1;
}

.v-table--sticky-header-column tr:first-child th:first-child {
  z-index: 3;
}

.v-table__body {
  width: 100%;
  height: 100%;

  overflow: auto;

  will-change: scroll-position;
}

.v-table__table {
  width: 100%;
  max-width: 100%;

  font-size: 14px;
  white-space: nowrap;

  border-collapse: collapse;

  background-color: transparent;

  /* border-left: 1px solid rgb(147, 147, 147); */
}

.v-table__table-body {
  background-color: rgb(255 255 255);
}

.v-table__table-head-checkbox-cell {
  width: 4.5rem;
}

.v-table__table-head-cell {
  padding: 1rem;

  color: var(--n-sys-color-primary);

  border-top: 1px solid var(--n-sys-color-info-300);
  border-bottom: 1px solid var(--n-sys-color-info-300);
}

.v-table__footer {
  padding: 0.75rem 1rem;

  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.025em;
  text-transform: uppercase;

  border-top: 1px solid hsl(220deg 13% 91%);

  background-color: hsl(210deg 20% 98%);
}

.v-table__count {
  color: rgb(112 114 117);
  text-transform: uppercase;
}

.v-table__table-body-cell {
  padding: 0;
  padding-left: var(--v-table-cell-left-padding, 0);

  border-bottom: 1px solid var(--n-sys-color-info-300);
}

.v-table__table-body-cell-inner {
  position: relative;

  display: flex;
  gap: 0.5rem;
  align-items: center;

  padding: 1rem 0.5rem;
}

.v-table__table-body-cell--checkbox-cell {
  width: 4.5rem;
}

.v-table__table-body-cell--checkbox-cell .v-table__table-body-cell-inner {
  display: flex;
  justify-content: center;
}

.v-table__table-body-cell-expander {
  position: absolute;
  top: 50%;
  left: 0;

  transform: translate(calc(-100% - 4px), -50%);
}
</style>
