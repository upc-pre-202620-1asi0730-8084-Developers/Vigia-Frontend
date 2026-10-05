<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDiscrepancyStore } from '../../application/discrepancy.store.js'

const route = useRoute()
const discrepancyStore = useDiscrepancyStore()

const generateReport = async () => {
  const result = await discrepancyStore.generateSupportingReport(
      discrepancyCase.value.id
  )

  if (result) {
    alert(`Report generated: ${result.fileName}`)
  }
}

onMounted(() => {
  if (discrepancyStore.cases.length === 0) {
    discrepancyStore.loadCases()
  }
})

const discrepancyCase = computed(() => {
  return discrepancyStore.cases.find(
      item => item.id === Number(route.params.id)
  )
})
</script>

<template>
  <section>
    <h1>Issue Detail</h1>

    <div v-if="discrepancyStore.loading">
      Loading issue...
    </div>

    <div v-else-if="discrepancyCase">
      <p><strong>Dispatch:</strong> {{ discrepancyCase.dispatchId }}</p>
      <p><strong>Project:</strong> {{ discrepancyCase.projectName }}</p>
      <p><strong>Type:</strong> {{ discrepancyCase.issueType }}</p>
      <p><strong>Status:</strong> {{ discrepancyCase.status }}</p>
      <p><strong>Priority:</strong> {{ discrepancyCase.priority }}</p>
      <p><strong>Reported:</strong> {{ discrepancyCase.reportedAt }}</p>
      <p><strong>Description:</strong> {{ discrepancyCase.description }}</p>
      <h2>Evidence Timeline</h2>

      <div
          v-for="event in discrepancyCase.timeline"
          :key="event.id"
      >
        <p><strong>{{ event.stage }}</strong></p>
        <p>{{ event.title }}</p>
        <p>{{ event.description }}</p>
        <p>{{ event.date }}</p>
        <hr>
      </div>
      <button @click="generateReport">
        Generate Supporting Report
      </button>
    </div>

    <div v-else>
      Issue not found.
    </div>
  </section>
</template>