<script setup>
import {useI18n} from "vue-i18n";
import {computed, onMounted, ref, toRefs} from "vue";
import useProjectManagementStore from "../../application/project-management.store.js";
import {PROJECT_STATUS, PROJECT_ZONE, projectStatusSeverity} from "../../domain/project-status.js";
import DonutChart from "../../../shared/presentation/components/donut-chart.vue";
import KpiCard from "../../../shared/presentation/components/kpi-card.vue";

const {t} = useI18n();
const store = useProjectManagementStore();
const {projects, projectsLoading, errors, activeCount, atRiskCount, inProgressCount, delayedCount, projectsByZone} = toRefs(store);
const {fetchProjects} = store;

onMounted(() => {
  if (!store.projectsLoaded) fetchProjects();
});

const ALL = 'ALL';
const status = ref(ALL);
const zone = ref(ALL);
const manager = ref(ALL);

const allOption = computed(() => ({label: t('projects.filters.all'), value: ALL}));
const statusOptions = computed(() => [allOption.value,
  ...Object.values(PROJECT_STATUS).map(value => ({label: t(`projects.status.${value}`), value}))]);
const zoneOptions = computed(() => [allOption.value,
  ...Object.values(PROJECT_ZONE).map(value => ({label: t(`projects.zone.${value}`), value}))]);
const managerOptions = computed(() => [allOption.value,
  ...[...new Set(projects.value.map(p => p.managerName))].sort().map(name => ({label: name, value: name}))]);

const filteredProjects = computed(() => projects.value.filter(p =>
    (status.value === ALL || p.status === status.value) &&
    (zone.value === ALL || p.zone === zone.value) &&
    (manager.value === ALL || p.managerName === manager.value)));

const clearFilters = () => {
  status.value = ALL;
  zone.value = ALL;
  manager.value = ALL;
};

/** Zone colors taken from the palette tokens (src/style.css). */
const ZONE_COLORS = {
  [PROJECT_ZONE.LIMA]: 'var(--color-success)',
  [PROJECT_ZONE.NORTH]: 'var(--color-accent)',
  [PROJECT_ZONE.SOUTH]: 'var(--color-primary-light)',
  [PROJECT_ZONE.CENTER]: 'var(--color-error)',
  [PROJECT_ZONE.EAST]: 'var(--color-text-secondary)'
};
const zoneSegments = computed(() => projectsByZone.value.map(({zone, count}) => ({
  key: zone, label: t(`projects.zone.${zone}`), value: count, color: ZONE_COLORS[zone]
})));
const topZone = computed(() => projectsByZone.value[0] ?? null);

/** City and zone of a project, without repeating the name when both match (e.g. Lima). */
const zoneLabel = project => {
  const zoneName = t(`projects.zone.${project.zone}`);
  return project.city === zoneName ? project.city : `${project.city} · ${zoneName}`;
};

/** Progress bar color follows the project status. */
const PROGRESS_COLORS = {
  [PROJECT_STATUS.IN_PROGRESS]: 'var(--color-success)',
  [PROJECT_STATUS.DELAYED]: 'var(--color-accent)',
  [PROJECT_STATUS.AT_RISK]: 'var(--color-error)'
};

const kpis = computed(() => [
  {key: 'active', icon: 'pi pi-building', tone: 'primary', value: activeCount.value},
  {key: 'atRisk', icon: 'pi pi-exclamation-triangle', tone: 'error', value: atRiskCount.value},
  {key: 'inProgress', icon: 'pi pi-play', tone: 'success', value: inProgressCount.value},
  {key: 'delayed', icon: 'pi pi-clock', tone: 'accent', value: delayedCount.value}
]);
</script>

<template>
  <div class="p-4">
    <h1 class="mb-1">{{ t('projects.title') }}</h1>
    <p class="subtitle mt-0 mb-4">{{ t('projects.subtitle') }}</p>

    <div class="grid mb-2">
      <div v-for="kpi in kpis" :key="kpi.key" class="col-12 md:col-6 xl:col-3">
        <KpiCard :icon="kpi.icon" :tone="kpi.tone" :label="t(`projects.kpi.${kpi.key}`)" :value="kpi.value" />
      </div>
    </div>

    <div class="vigia-card filters mb-3">
      <div class="filter">
        <label for="project-status-filter">{{ t('projects.filters.status') }}</label>
        <pv-select v-model="status" input-id="project-status-filter" :options="statusOptions" option-label="label" option-value="value" />
      </div>
      <div class="filter">
        <label for="project-zone-filter">{{ t('projects.filters.zone') }}</label>
        <pv-select v-model="zone" input-id="project-zone-filter" :options="zoneOptions" option-label="label" option-value="value" />
      </div>
      <div class="filter">
        <label for="project-manager-filter">{{ t('projects.filters.manager') }}</label>
        <pv-select v-model="manager" input-id="project-manager-filter" :options="managerOptions" option-label="label" option-value="value" />
      </div>
      <pv-button :label="t('projects.filters.clear')" icon="pi pi-filter-slash" class="btn-secondary clear-button" @click="clearFilters" />
    </div>

    <div class="grid">
      <div class="col-12 xl:col-8">
        <div class="vigia-card">
          <div class="card-header">
            <h2 class="m-0">{{ t('projects.list.title') }}</h2>
            <span class="subtitle">{{ t('projects.list.total', {count: filteredProjects.length}) }}</span>
          </div>
          <pv-data-table :value="filteredProjects" :loading="projectsLoading" data-key="id" striped-rows
                         class="p-datatable-sm" table-style="min-width: 52rem">
            <template #empty>{{ t('projects.list.empty') }}</template>
            <pv-column :header="t('projects.table.index')" style="width: 3rem">
              <template #body="{index}">{{ index + 1 }}</template>
            </pv-column>
            <pv-column field="name" :header="t('projects.table.project')" sortable>
              <template #body="{data}"><span class="font-semibold">{{ data.name }}</span></template>
            </pv-column>
            <pv-column :header="t('projects.table.zone')">
              <template #body="{data}">{{ zoneLabel(data) }}</template>
            </pv-column>
            <pv-column field="managerName" :header="t('projects.table.manager')" sortable />
            <pv-column field="progress" :header="t('projects.table.progress')" sortable>
              <template #body="{data}">
                <div class="progress">
                  <span class="progress-value">{{ data.progress }}%</span>
                  <span class="progress-track">
                    <span class="progress-fill" :style="{width: `${data.progress}%`, background: PROGRESS_COLORS[data.status]}" />
                  </span>
                </div>
              </template>
            </pv-column>
            <pv-column field="dispatchesCount" :header="t('projects.table.dispatches')" sortable />
            <pv-column field="receptionsCount" :header="t('projects.table.receptions')" sortable />
            <pv-column field="incidentsCount" :header="t('projects.table.incidents')" sortable />
            <pv-column :header="t('projects.table.status')">
              <template #body="{data}">
                <pv-tag :value="t(`projects.status.${data.status}`)" :severity="projectStatusSeverity(data.status)" />
              </template>
            </pv-column>
          </pv-data-table>
        </div>
      </div>

      <div class="col-12 xl:col-4">
        <div class="vigia-card">
          <h2 class="mt-0 mb-3">{{ t('projects.byZone.title') }}</h2>
          <DonutChart :segments="zoneSegments" :center-label="t('projects.byZone.projects')" />
          <div v-if="topZone" class="top-zone mt-4">
            <i class="pi pi-map-marker" aria-hidden="true" />
            <div>
              <small class="subtitle">{{ t('projects.byZone.topZone') }}</small>
              <div class="font-bold">{{ t('projects.byZone.topZoneValue', {zone: t(`projects.zone.${topZone.zone}`), count: topZone.count}) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>
  </div>
</template>

<style scoped>
.subtitle {
  color: var(--color-text-secondary);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--sp-16);
}

.filter {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  flex: 1;
  min-width: 12rem;
}

.filter label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--sp-8);
  margin-bottom: var(--sp-16);
}

.progress {
  display: flex;
  align-items: center;
  gap: var(--sp-8);
}

.progress-value {
  font-weight: 600;
  min-width: 2.5rem;
}

.progress-track {
  flex: 1;
  min-width: 4rem;
  height: 6px;
  border-radius: 3px;
  background-color: var(--p-content-border-color);
  overflow: hidden;
}

.progress-fill {
  display: block;
  height: 100%;
  border-radius: 3px;
}

.top-zone {
  display: flex;
  align-items: center;
  gap: var(--sp-16);
  padding: var(--sp-16);
  border-radius: var(--radius-actionable);
  background-color: var(--color-bg);
}

.top-zone .pi {
  font-size: 1.25rem;
  color: var(--color-primary);
}
</style>
