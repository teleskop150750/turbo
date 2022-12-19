<script setup>
import { inject } from 'vue'

import NTrackerTabPanel from '../../components/NTrackerTabPanel/NTrackerTabPanel.vue'
import { LAYOUT_DEFAULT_KEY } from '../../tokens/layout-default.js'
import Chart from './components/Chart.vue'
import Table from './components/Table.vue'

const layout = inject(LAYOUT_DEFAULT_KEY)

layout.setTitle('Доступные задачи')
</script>

<template>
  <NTrackerTabPanel>
    <template #table>
      <Table />
    </template>
    <template #chart>
      <Chart />
    </template>
  </NTrackerTabPanel>
</template>
