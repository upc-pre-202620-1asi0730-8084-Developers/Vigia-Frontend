<script setup>
import { computed, onMounted, ref } from 'vue'
import { useDiscrepancyStore } from '../../application/discrepancy.store.js'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const discrepancyStore = useDiscrepancyStore()
const router = useRouter()
const { t } = useI18n()


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
    <h1>{{ t('issues.title') }}</h1>

    <div>
      <label for="project-filter">
        {{ t('issues.filters.project') }}
      </label>

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

      <label for="status-filter">
        {{ t('issues.filters.status') }}
      </label>

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
      {{ t('issues.loading') }}
    </div>

    <div v-else-if="discrepancyStore.error">
      {{ t('issues.loadError') }}
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
        {{ t(`issues.values.status.${discrepancyCase.status}`) }}
      </li>
    </ul>
  </section>
</template>