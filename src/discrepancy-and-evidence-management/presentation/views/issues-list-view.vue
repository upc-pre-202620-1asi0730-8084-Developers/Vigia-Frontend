<script setup>
import { computed, onMounted, ref } from 'vue'
import { useDiscrepancyStore } from '../../application/discrepancy.store.js'
import { useRouter } from 'vue-router'

const discrepancyStore = useDiscrepancyStore()
const router = useRouter()

const openIssueDetail = (id) => {
  router.push(`/problemas/${id}`)
}
const selectedProject = ref('All')
const selectedStatus = ref('All')

onMounted(() => {
  discrepancyStore.loadCases()
})

const projects = computed(() => {
  const uniqueProjects = [
    ...new Set(discrepancyStore.cases.map(item => item.projectName))
  ]

  return ['All', ...uniqueProjects]
})

const statuses = ['All', 'Open', 'Under Review', 'Closed']

const filteredCases = computed(() => {
  return discrepancyStore.cases.filter(item => {
    const matchesProject =
        selectedProject.value === 'All' ||
        item.projectName === selectedProject.value

    const matchesStatus =
        selectedStatus.value === 'All' ||
        item.status === selectedStatus.value

    return matchesProject && matchesStatus
  })
})
</script>

<template>
  <section>
    <h1>Issues</h1>

    <div>
      <label for="project-filter">Project</label>

      <select
          id="project-filter"
          v-model="selectedProject"
      >
        <option
            v-for="project in projects"
            :key="project"
            :value="project"
        >
          {{ project }}
        </option>
      </select>

      <label for="status-filter">Status</label>

      <select
          id="status-filter"
          v-model="selectedStatus"
      >
        <option
            v-for="status in statuses"
            :key="status"
            :value="status"
        >
          {{ status }}
        </option>
      </select>
    </div>

    <div v-if="discrepancyStore.loading">
      Loading issues...
    </div>

    <div v-else-if="discrepancyStore.error">
      Error loading issues.
    </div>

    <ul v-else>
      <li
          v-for="discrepancyCase in filteredCases"
          :key="discrepancyCase.id"
          @click="openIssueDetail(discrepancyCase.id)"
          style="cursor: pointer;"
      >
        {{ discrepancyCase.dispatchId }} -
        {{ discrepancyCase.projectName }} -
        {{ discrepancyCase.status }}
      </li>
    </ul>
  </section>
</template>