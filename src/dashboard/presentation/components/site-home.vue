<script setup>
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import KpiCard from '../../../shared/presentation/components/kpi-card.vue';
import AttentionList from './attention-list.vue';
import ActivityFeed from './activity-feed.vue';
import ProjectProgressList from './project-progress-list.vue';
import useProjectManagementStore from '../../../project-management/application/project-management.store.js';
import useActivityHistoryStore from '../../../activity-history/application/activity-history.store.js';
import useIamStore from '../../../iam/application/iam.store.js';
import { useReceptionStore } from '../../../site-reception-and-verification/application/reception.store.js';
import { useDiscrepancyStore } from '../../../discrepancy-and-evidence-management/application/discrepancy.store.js';
import { PROJECT_STATUS } from '../../../project-management/domain/project-status.js';

/**
 * Home of the Site Manager: own projects, arrivals to receive and receptions to verify.
 */
const { t } = useI18n();
const projectStore = useProjectManagementStore();
const activityStore = useActivityHistoryStore();
const receptionStore = useReceptionStore();
const discrepancyStore = useDiscrepancyStore();
const iamStore = useIamStore();

onMounted(() => {
  if (!projectStore.projectsLoaded) projectStore.fetchProjects();
  if (!activityStore.recordsLoaded) activityStore.fetchRecords();
  if (!receptionStore.receptions.length) receptionStore.fetchReceptions();
  if (!receptionStore.upcomingArrivals.length) receptionStore.fetchUpcomingArrivals();
  if (!discrepancyStore.cases.length) discrepancyStore.loadCases();
});

const myProjects = computed(() => projectStore.projects.filter(p => p.managerId === iamStore.currentUserId));
const myReceptions = computed(() => receptionStore.receptions.filter(r => r.verifiedByUserName === iamStore.currentUsername));
const toVerify = computed(() => myReceptions.value.filter(r => r.status === 'ARRIVED'));
const withDifference = computed(() => myReceptions.value.filter(r => r.status === 'VERIFIED_DISCREPANT'));
const openCases = computed(() => discrepancyStore.cases.filter(c => c.status !== 'Closed'));

const kpis = computed(() => [
  { key: 'myProjects', icon: 'pi pi-building', tone: 'accent', value: myProjects.value.length },
  { key: 'upcomingArrivals', icon: 'pi pi-truck', tone: 'primary', value: receptionStore.upcomingArrivals.length },
  { key: 'receptionsToVerify', icon: 'pi pi-inbox', tone: 'success', value: toVerify.value.length },
  { key: 'openIncidents', icon: 'pi pi-exclamation-triangle', tone: 'error', value: openCases.value.length }
]);

const attentionItems = computed(() => [
  ...withDifference.value.map(r => ({ key: `rec-${r.id}`, icon: 'pi pi-exclamation-triangle', tone: 'error',
    description: t('home.attention.items.receptionDifference'), reference: r.id, site: r.siteName, priority: 'HIGH', to: '/recepciones' })),
  ...toVerify.value.map(r => ({ key: `ver-${r.id}`, icon: 'pi pi-inbox', tone: 'accent',
    description: t('home.attention.items.arrivalToVerify'), reference: r.id, site: r.siteName, priority: 'HIGH', to: '/recepciones' })),
  ...myProjects.value.filter(p => p.status === PROJECT_STATUS.AT_RISK).map(p => ({ key: `prj-${p.id}`, icon: 'pi pi-exclamation-triangle', tone: 'error',
    description: t('home.attention.items.projectAtRisk'), reference: p.id, site: p.name, priority: 'HIGH', to: '/obras' })),
  ...receptionStore.upcomingArrivals.map(a => ({ key: `arr-${a.id}`, icon: 'pi pi-truck', tone: 'primary',
    description: t('home.attention.items.upcomingArrival', { time: a.estimatedArrival }), reference: a.id, site: a.siteName, priority: 'MEDIUM', to: '/recepciones' })),
  ...openCases.value.map(c => ({ key: `case-${c.id}`, icon: 'pi pi-info-circle', tone: 'primary',
    description: t('home.attention.items.openCase'), reference: c.dispatchId, site: c.projectName,
    priority: c.priority === 'High' ? 'HIGH' : c.priority === 'Medium' ? 'MEDIUM' : 'LOW', to: `/problemas/${c.id}` }))
]);

const recentActivity = computed(() => activityStore.sortedRecords
    .filter(r => r.userName === iamStore.currentUsername || r.type === 'RECEPTION').slice(0, 5));
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
        <ProjectProgressList :title="t('home.projects.myTitle')" :projects="myProjects" :empty-text="t('home.projects.empty')" />
      </div>
      <div class="col-12 xl:col-5 flex flex-column gap-3">
        <div class="vigia-card">
          <div class="card-header">
            <h2 class="m-0">{{ t('home.arrivals.title') }}</h2>
            <router-link to="/recepciones" class="see-all">{{ t('home.seeAll') }}</router-link>
          </div>
          <p v-if="!receptionStore.upcomingArrivals.length" class="subtitle m-0">{{ t('home.arrivals.empty') }}</p>
          <ul v-else class="arrival-list">
            <li v-for="arrival in receptionStore.upcomingArrivals" :key="arrival.id">
              <span class="arrival-icon"><i class="pi pi-truck" aria-hidden="true" /></span>
              <div>
                <strong>{{ arrival.siteName }}</strong> · {{ arrival.material }}
                <div class="subtitle small">{{ arrival.id }} · {{ arrival.truckPlate }} · {{ arrival.estimatedArrival }}</div>
              </div>
            </li>
          </ul>
        </div>
        <ActivityFeed :records="recentActivity" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.subtitle {
  color: var(--color-text-secondary);
}

.small {
  font-size: 13px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: var(--sp-16);
}

.see-all {
  font-size: 13px;
  color: var(--color-primary-light);
}

.arrival-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-16);
}

.arrival-list li {
  display: flex;
  gap: var(--sp-16);
  align-items: flex-start;
}

.arrival-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary-light) 15%, var(--color-surface));
}
</style>
