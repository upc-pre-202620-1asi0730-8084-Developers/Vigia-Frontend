<script setup>
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import KpiCard from '../../../shared/presentation/components/kpi-card.vue';
import DonutChart from '../../../shared/presentation/components/donut-chart.vue';
import AttentionList from './attention-list.vue';
import ActivityFeed from './activity-feed.vue';
import ProjectProgressList from './project-progress-list.vue';
import useProjectManagementStore from '../../../project-management/application/project-management.store.js';
import useOrderManagementStore from '../../../order-management-and-distpatch/application/order-management.store.js';
import useTransitTraceabilityStore from '../../../transit-traceability/application/transit-traceability.store.js';
import useActivityHistoryStore from '../../../activity-history/application/activity-history.store.js';
import { useReceptionStore } from '../../../site-reception-and-verification/application/reception.store.js';
import { useDiscrepancyStore } from '../../../discrepancy-and-evidence-management/application/discrepancy.store.js';
import { PROJECT_STATUS } from '../../../project-management/domain/project-status.js';
import { DISPATCH_STATUS } from '../../../order-management-and-distpatch/domain/dispatch-status.js';

/**
 * Home of the Supervisor (Admin): status of the whole operation.
 */
const { t } = useI18n();
const projectStore = useProjectManagementStore();
const orderStore = useOrderManagementStore();
const transitStore = useTransitTraceabilityStore();
const activityStore = useActivityHistoryStore();
const receptionStore = useReceptionStore();
const discrepancyStore = useDiscrepancyStore();

onMounted(() => {
  if (!projectStore.projectsLoaded) projectStore.fetchProjects();
  if (!orderStore.dispatchesLoaded) orderStore.fetchDispatches();
  if (!transitStore.routesLoaded) transitStore.fetchRoutes();
  if (!activityStore.recordsLoaded) activityStore.fetchRecords();
  if (!receptionStore.receptions.length) receptionStore.fetchReceptions();
  if (!discrepancyStore.cases.length) discrepancyStore.loadCases();
});

const discrepantReceptions = computed(() => receptionStore.receptions.filter(r => r.status === 'VERIFIED_DISCREPANT'));
const openCases = computed(() => discrepancyStore.cases.filter(c => c.status !== 'Closed'));

const kpis = computed(() => [
  { key: 'activeProjects', icon: 'pi pi-building', tone: 'accent', value: projectStore.projects.length },
  { key: 'dispatchesInTransit', icon: 'pi pi-truck', tone: 'primary', value: orderStore.dispatches.filter(d => d.status === DISPATCH_STATUS.IN_TRANSIT).length },
  { key: 'receptionsWithDifference', icon: 'pi pi-inbox', tone: 'error', value: discrepantReceptions.value.length },
  { key: 'openIncidents', icon: 'pi pi-exclamation-triangle', tone: 'error', value: openCases.value.length }
]);

const attentionItems = computed(() => [
  ...discrepantReceptions.value.map(r => ({ key: `rec-${r.id}`, icon: 'pi pi-exclamation-triangle', tone: 'error',
    description: t('home.attention.items.receptionDifference'), reference: r.id, site: r.siteName, priority: 'HIGH', to: '/recepciones' })),
  ...projectStore.projects.filter(p => p.status === PROJECT_STATUS.AT_RISK).map(p => ({ key: `prj-${p.id}`, icon: 'pi pi-exclamation-triangle', tone: 'error',
    description: t('home.attention.items.projectAtRisk'), reference: p.id, site: p.name, priority: 'HIGH', to: '/obras' })),
  ...transitStore.routes.flatMap(r => r.pendingNotifications.map(a => ({ key: `alert-${a.id}`, icon: 'pi pi-map-marker', tone: 'accent',
    description: t('home.attention.items.transitAlert'), reference: r.id, site: r.destination.name, priority: 'HIGH', to: '/transporte' }))),
  ...openCases.value.map(c => ({ key: `case-${c.id}`, icon: 'pi pi-info-circle', tone: 'primary',
    description: t('home.attention.items.openCase'), reference: c.dispatchId, site: c.projectName,
    priority: c.priority === 'High' ? 'HIGH' : c.priority === 'Medium' ? 'MEDIUM' : 'LOW', to: `/problemas/${c.id}` })),
  ...projectStore.projects.filter(p => p.status === PROJECT_STATUS.DELAYED).map(p => ({ key: `prj-${p.id}`, icon: 'pi pi-clock', tone: 'accent',
    description: t('home.attention.items.projectDelayed'), reference: p.id, site: p.name, priority: 'MEDIUM', to: '/obras' }))
]);

/** Dispatch status colors taken from the palette tokens (src/style.css). */
const DISPATCH_COLORS = {
  [DISPATCH_STATUS.IN_PREPARATION]: 'var(--color-accent)',
  [DISPATCH_STATUS.SCHEDULED]: 'var(--color-text-secondary)',
  [DISPATCH_STATUS.IN_TRANSIT]: 'var(--color-primary-light)',
  [DISPATCH_STATUS.NEAR_SITE]: 'var(--color-primary)',
  [DISPATCH_STATUS.DELIVERED]: 'var(--color-success)',
  [DISPATCH_STATUS.WITH_INCIDENT]: 'var(--color-error)'
};
const dispatchSegments = computed(() => Object.values(DISPATCH_STATUS)
    .map(status => ({ key: status, label: t(`dispatches.status.${status}`), color: DISPATCH_COLORS[status],
      value: orderStore.dispatches.filter(d => d.status === status).length }))
    .filter(segment => segment.value > 0));

const topProjects = computed(() => projectStore.projects.slice(0, 6));
const recentActivity = computed(() => activityStore.sortedRecords.slice(0, 5));
</script>

<template>
  <div>
    <div class="grid mb-2">
      <div v-for="kpi in kpis" :key="kpi.key" class="col-12 md:col-6 xl:col-3">
        <KpiCard :icon="kpi.icon" :tone="kpi.tone" :label="t(`home.kpi.${kpi.key}`)" :value="kpi.value" />
      </div>
    </div>
    <div class="grid">
      <div class="col-12 xl:col-7 flex flex-column gap-3">
        <AttentionList :items="attentionItems" />
        <ProjectProgressList :title="t('home.projects.title')" :projects="topProjects" :empty-text="t('home.projects.empty')" />
      </div>
      <div class="col-12 xl:col-5 flex flex-column gap-3">
        <div class="vigia-card">
          <h2 class="mt-0 mb-3">{{ t('home.operations.title') }}</h2>
          <DonutChart :segments="dispatchSegments" :center-label="t('home.operations.dispatches')" />
        </div>
        <ActivityFeed :records="recentActivity" />
      </div>
    </div>
  </div>
</template>
