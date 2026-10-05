<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useDiscrepancyStore } from '../../application/discrepancy.store.js'

const route = useRoute()
const discrepancyStore = useDiscrepancyStore()
const selectedResponsibility = ref('')

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

const saveResponsibility = async () => {
  if (!selectedResponsibility.value) {
    alert('Select a responsibility first.')
    return
  }

  await discrepancyStore.determineResponsibility(
      discrepancyCase.value.id,
      selectedResponsibility.value
  )

  alert('Responsibility updated.')
}

const discrepancyCase = computed(() => {
  return discrepancyStore.cases.find(
      item => item.id === Number(route.params.id)
  )
})

const closeDiscrepancyCase = async () => {
  const result = await discrepancyStore.closeCase(
      discrepancyCase.value.id
  )

  if (!result) {
    return
  }

  alert(
      result.closed
          ? 'Case closed successfully.'
          : result.message
  )
}


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
      <h2>Missing Evidence</h2>

      <div v-if="discrepancyCase.missingEvidence.length > 0">
        <ul>
          <li
              v-for="evidence in discrepancyCase.missingEvidence"
              :key="evidence"
          >
            {{ evidence }}
          </li>
        </ul>
      </div>

      <p v-else>
        No missing evidence.
      </p>

      <button @click="generateReport">
        Generate Supporting Report
      </button>
      <h2>Determine Responsibility</h2>

      <select v-model="selectedResponsibility">
        <option value="">Select responsibility</option>
        <option value="Warehouse">Warehouse</option>
        <option value="Transport">Transport</option>
        <option value="Site">Site</option>
      </select>

      <button @click="saveResponsibility">
        Save Responsibility
      </button>

      <p v-if="discrepancyCase.responsibility">
        <strong>Current Responsibility:</strong>
        {{ discrepancyCase.responsibility }}
      </p>
      <button @click="closeDiscrepancyCase">
        Close Case
      </button>


    </div>

    <div v-else>
      Issue not found.
    </div>
  </section>
</template>