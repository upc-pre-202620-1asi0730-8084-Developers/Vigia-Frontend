<script setup>
import { onMounted } from 'vue'
import { useDiscrepancyStore } from '../../application/discrepancy.store.js'

const discrepancyStore = useDiscrepancyStore()

onMounted(() => {
  discrepancyStore.loadCases()
})
</script>

<template>
  <section>
    <h1>Issues</h1>

    <div v-if="discrepancyStore.loading">
      Loading issues...
    </div>

    <div v-else-if="discrepancyStore.error">
      Error loading issues.
    </div>

    <ul v-else>
      <li
          v-for="discrepancyCase in discrepancyStore.cases"
          :key="discrepancyCase.id"
      >
        {{ discrepancyCase.dispatchId }} -
        {{ discrepancyCase.projectName }} -
        {{ discrepancyCase.status }}
      </li>
    </ul>
  </section>
</template>