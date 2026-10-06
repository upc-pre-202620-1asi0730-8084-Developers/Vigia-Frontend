<script setup>
import { computed, onMounted, ref } from 'vue'
import { useDiscrepancyStore } from '../../application/discrepancy.store.js'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const discrepancyStore = useDiscrepancyStore()
const router = useRouter()
const { t } = useI18n()

const ALL = 'All'
const STATUSES = ['Open', 'Under Review', 'Closed']

const openIssueDetail = (id) => {
  router.push(`/problemas/${id}`)
}
const selectedProject = ref(ALL)
const selectedStatus = ref(ALL)

onMounted(() => {
  discrepancyStore.loadCases()
})

const projectOptions = computed(() => {
  const uniqueProjects = [
    ...new Set(discrepancyStore.cases.map(item => item.projectName))
  ]

  return [
    { label: t('issues.filters.all'), value: ALL },
    ...uniqueProjects.map(project => ({ label: project, value: project }))
  ]
})

const statusOptions = computed(() => [
  { label: t('issues.filters.all'), value: ALL },
  ...STATUSES.map(status => ({ label: t(`issues.values.status.${status}`), value: status }))
])

const filteredCases = computed(() => {
  return discrepancyStore.cases.filter(item => {
    const matchesProject =
        selectedProject.value === ALL ||
        item.projectName === selectedProject.value

    const matchesStatus =
        selectedStatus.value === ALL ||
        item.status === selectedStatus.value

    return matchesProject && matchesStatus
  })
})

const statusSeverity = (status) => {
  if (status === 'Open') return 'danger'
  if (status === 'Under Review') return 'warn'
  return 'success'
}

const prioritySeverity = (priority) => {
  if (priority === 'High') return 'danger'
  if (priority === 'Medium') return 'warn'
  return 'secondary'
}
</script>

<template>
  <section class="p-4">
    <h1>{{ t('issues.title') }}</h1>

    <div class="flex flex-wrap gap-3 mb-3">
      <div class="flex flex-column gap-1">
        <label for="project-filter" class="filter-label">{{ t('issues.filters.project') }}</label>
        <pv-select
            v-model="selectedProject"
            input-id="project-filter"
            :options="projectOptions"
            option-label="label"
            option-value="value"
            class="filter-select"
        />
      </div>

      <div class="flex flex-column gap-1">
        <label for="status-filter" class="filter-label">{{ t('issues.filters.status') }}</label>
        <pv-select
            v-model="selectedStatus"
            input-id="status-filter"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            class="filter-select"
        />
      </div>
    </div>

    <div v-if="discrepancyStore.error" class="text-red-500 mb-3">
      {{ t('issues.loadError') }}
    </div>

    <pv-data-table
        :value="filteredCases"
        :loading="discrepancyStore.loading"
        data-key="id"
        striped-rows
        row-hover
        table-style="min-width: 50rem"
        class="issues-table"
        @row-click="event => openIssueDetail(event.data.id)"
    >
      <template #empty>{{ discrepancyStore.loading ? t('issues.loading') : t('issues.notFound') }}</template>
      <pv-column field="dispatchId" :header="t('issues.fields.dispatch')" sortable />
      <pv-column field="projectName" :header="t('issues.fields.project')" sortable />
      <pv-column :header="t('issues.fields.type')">
        <template #body="{ data }">{{ t(`issues.values.type.${data.issueType}`) }}</template>
      </pv-column>
      <pv-column :header="t('issues.fields.priority')">
        <template #body="{ data }">
          <pv-tag :value="t(`issues.values.priority.${data.priority}`)" :severity="prioritySeverity(data.priority)" />
        </template>
      </pv-column>
      <pv-column field="reportedAt" :header="t('issues.fields.reported')" sortable />
      <pv-column :header="t('issues.fields.status')">
        <template #body="{ data }">
          <pv-tag :value="t(`issues.values.status.${data.status}`)" :severity="statusSeverity(data.status)" />
        </template>
      </pv-column>
      <pv-column style="width: 3rem">
        <template #body><i class="pi pi-chevron-right row-arrow" aria-hidden="true" /></template>
      </pv-column>
    </pv-data-table>
  </section>
</template>

<style scoped>
.filter-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.filter-select {
  min-width: 14rem;
}

.issues-table :deep(tbody tr) {
  cursor: pointer;
}

.row-arrow {
  color: var(--color-text-secondary);
}
</style>
