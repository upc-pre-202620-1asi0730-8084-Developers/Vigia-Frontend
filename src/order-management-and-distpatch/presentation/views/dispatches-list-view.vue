<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDispatchStore } from '../../application/dispatch.store.js';
import { DISPATCH_STATUS, dispatchStatusSeverity } from '../../domain/dispatch-status.js';

const { t } = useI18n();
const router = useRouter();
const dispatchStore = useDispatchStore();

const searchQuery = ref('');
const selectedStatus = ref('ALL');

onMounted(() => {
  dispatchStore.loadDispatches();
});

const statusOptions = computed(() => [
  { label: t('dispatches.filters.all'), value: 'ALL' },
  ...Object.values(DISPATCH_STATUS).map(value => ({ label: t(`dispatches.status.${value}`), value }))
]);

const filteredDispatches = computed(() => {
  return dispatchStore.dispatches.filter(dispatch => {
    const matchesStatus = selectedStatus.value === 'ALL' || dispatch.status === selectedStatus.value;
    const q = searchQuery.value.trim().toLowerCase();
    const matchesQuery = !q
      || dispatch.id.toLowerCase().includes(q)
      || dispatch.projectName.toLowerCase().includes(q)
      || (dispatch.items[0]?.material || '').toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });
});

function clearFilters() {
  searchQuery.value = '';
  selectedStatus.value = 'ALL';
}

function newDispatch() {
  router.push('/despachos/nuevo');
}

function mainMaterial(dispatch) {
  return dispatch.items.length ? dispatch.items[0].material : '—';
}

function totalQuantity(dispatch) {
  const main = dispatch.items[0];
  if (!main) return '—';
  const extra = dispatch.items.length > 1 ? ` +${dispatch.items.length - 1}` : '';
  return `${main.quantity} ${main.unit}${extra}`.trim();
}
</script>

<template>
  <section class="dispatches-view">
    <header class="view-header">
      <div>
        <h1 class="m-0">{{ t('dispatches.title') }}</h1>
        <p class="subtitle m-0">{{ t('dispatches.subtitle') }}</p>
      </div>
      <pv-button :label="t('dispatches.newButton')" icon="pi pi-plus" class="btn-accent" @click="newDispatch" />
    </header>

    <!-- KPIs -->
    <div class="kpi-grid">
      <pv-card class="kpi-card">
        <template #content>
          <span class="kpi-label"><i class="pi pi-box mr-2" />{{ t('dispatches.kpi.inPreparation') }}</span>
          <div class="kpi-value">{{ dispatchStore.inPreparationCount }}</div>
        </template>
      </pv-card>
      <pv-card class="kpi-card">
        <template #content>
          <span class="kpi-label"><i class="pi pi-calendar mr-2" />{{ t('dispatches.kpi.scheduled') }}</span>
          <div class="kpi-value">{{ dispatchStore.scheduledCount }}</div>
        </template>
      </pv-card>
      <pv-card class="kpi-card">
        <template #content>
          <span class="kpi-label"><i class="pi pi-send mr-2" />{{ t('dispatches.kpi.inTransit') }}</span>
          <div class="kpi-value">{{ dispatchStore.inTransitCount }}</div>
        </template>
      </pv-card>
      <pv-card class="kpi-card">
        <template #content>
          <span class="kpi-label"><i class="pi pi-exclamation-triangle mr-2" />{{ t('dispatches.kpi.withIncident') }}</span>
          <div class="kpi-value">{{ dispatchStore.withIncidentCount }}</div>
        </template>
      </pv-card>
    </div>

    <!-- Filtros -->
    <pv-card class="filters-card">
      <template #content>
        <div class="filters-row">
          <pv-icon-field class="flex-1">
            <pv-input-icon class="pi pi-search" />
            <pv-input-text v-model="searchQuery" :placeholder="t('dispatches.filters.search')" class="w-full" />
          </pv-icon-field>
          <pv-select v-model="selectedStatus" :options="statusOptions" option-label="label" option-value="value"
                     :placeholder="t('dispatches.filters.status')" class="filter-select" />
          <pv-button :label="t('dispatches.filters.clean')" icon="pi pi-filter-slash" text @click="clearFilters" />
        </div>
      </template>
    </pv-card>

    <!-- Tabla -->
    <pv-card class="list-card">
      <template #content>
        <h3 class="section-title">{{ t('dispatches.listTitle') }}</h3>
        <pv-data-table :value="filteredDispatches" :loading="dispatchStore.loading" data-key="id"
                       paginator :rows="8" responsive-layout="scroll">
          <pv-column field="id" :header="t('dispatches.table.id')" />
          <pv-column field="projectName" :header="t('dispatches.table.work')" />
          <pv-column :header="t('dispatches.table.materials')">
            <template #body="{ data }">{{ mainMaterial(data) }}</template>
          </pv-column>
          <pv-column :header="t('dispatches.table.quantity')">
            <template #body="{ data }">{{ totalQuantity(data) }}</template>
          </pv-column>
          <pv-column :header="t('dispatches.table.transport')">
            <template #body="{ data }">
              <span v-if="data.hasTransport">{{ data.transportId }}</span>
              <pv-tag v-else :value="t('dispatches.unassigned')" severity="secondary" />
            </template>
          </pv-column>
          <pv-column :header="t('dispatches.table.exit')">
            <template #body="{ data }">{{ data.departureDate }} · {{ data.estimatedTime }}</template>
          </pv-column>
          <pv-column :header="t('dispatches.table.status')">
            <template #body="{ data }">
              <pv-tag :value="t(`dispatches.status.${data.status}`)" :severity="dispatchStatusSeverity(data.status)" />
            </template>
          </pv-column>
        </pv-data-table>
      </template>
    </pv-card>
  </section>
</template>

<style scoped>
.dispatches-view { width: 100%; display: flex; flex-direction: column; gap: var(--sp-16); }
.dispatches-view :deep(.p-card) { color: var(--color-text-main); }
.view-header { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--sp-16); flex-wrap: wrap; }
.subtitle { color: var(--color-text-secondary); font-size: 14px; margin-top: 4px; }

.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-16); }
.kpi-card :deep(.p-card-content) { padding: var(--sp-8) 0; }
.kpi-label { color: var(--color-text-secondary); font-size: 13px; font-weight: 500; display: flex; align-items: center; }
.kpi-value { font-size: 28px; font-weight: 700; color: var(--color-primary); margin-top: var(--sp-8); }

.filters-row { display: flex; gap: var(--sp-16); align-items: center; flex-wrap: wrap; }
.flex-1 { flex: 1 1 240px; }
.filter-select { min-width: 180px; }
.section-title { color: var(--color-primary); margin-bottom: var(--sp-16); }

@media (max-width: 900px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .kpi-grid { grid-template-columns: 1fr; } }
</style>
