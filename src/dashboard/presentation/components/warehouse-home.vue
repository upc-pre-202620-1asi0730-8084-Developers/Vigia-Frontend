<script setup>
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import KpiCard from '../../../shared/presentation/components/kpi-card.vue';
import DonutChart from '../../../shared/presentation/components/donut-chart.vue';
import AttentionList from './attention-list.vue';
import ActivityFeed from './activity-feed.vue';
import useOrderManagementStore from '../../../order-management-and-distpatch/application/order-management.store.js';
import useInventoryManagementStore from '../../../inventory-management/application/inventory-management.store.js';
import useTransitTraceabilityStore from '../../../transit-traceability/application/transit-traceability.store.js';
import useActivityHistoryStore from '../../../activity-history/application/activity-history.store.js';
import useIamStore from '../../../iam/application/iam.store.js';
import { ORDER_STATUS } from '../../../order-management-and-distpatch/domain/order-status.js';
import { DISPATCH_STATUS, dispatchStatusSeverity } from '../../../order-management-and-distpatch/domain/dispatch-status.js';

/**
 * Home of the Warehouse Manager: requests to attend, dispatches to send and stock.
 */
const { t } = useI18n();
const orderStore = useOrderManagementStore();
const inventoryStore = useInventoryManagementStore();
const transitStore = useTransitTraceabilityStore();
const activityStore = useActivityHistoryStore();
const iamStore = useIamStore();

onMounted(() => {
  if (!orderStore.ordersLoaded) orderStore.fetchOrders();
  if (!orderStore.dispatchesLoaded) orderStore.fetchDispatches();
  if (!inventoryStore.inventoryLoaded) inventoryStore.fetchInventory();
  if (!transitStore.routesLoaded) transitStore.fetchRoutes();
  if (!activityStore.recordsLoaded) activityStore.fetchRecords();
});

const pendingOrders = computed(() => orderStore.orders.filter(o => o.status === ORDER_STATUS.PENDING));
const dispatchesToLeave = computed(() => orderStore.dispatches.filter(d =>
    d.status === DISPATCH_STATUS.IN_PREPARATION || d.status === DISPATCH_STATUS.SCHEDULED));
const lowStockMaterials = computed(() => inventoryStore.materials.filter(m => m.isLowStock));

const kpis = computed(() => [
  { key: 'pendingOrders', icon: 'pi pi-file-edit', tone: 'accent', value: pendingOrders.value.length },
  { key: 'dispatchesToLeave', icon: 'pi pi-send', tone: 'primary', value: dispatchesToLeave.value.length },
  { key: 'vehiclesInTransit', icon: 'pi pi-truck', tone: 'success', value: transitStore.activeCount },
  { key: 'lowStock', icon: 'pi pi-exclamation-triangle', tone: 'error', value: lowStockMaterials.value.length }
]);

const attentionItems = computed(() => [
  ...pendingOrders.value.filter(o => o.priority === 'HIGH').map(o => ({ key: `ord-${o.id}`, icon: 'pi pi-exclamation-triangle', tone: 'error',
    description: t('home.attention.items.urgentOrder'), reference: o.id, site: o.projectName, priority: 'HIGH', to: `/solicitudes/${o.id}` })),
  ...transitStore.routes.flatMap(r => r.pendingNotifications.map(a => ({ key: `alert-${a.id}`, icon: 'pi pi-map-marker', tone: 'accent',
    description: t('home.attention.items.transitAlert'), reference: r.id, site: r.destination.name, priority: 'HIGH', to: '/transporte' }))),
  ...dispatchesToLeave.value.filter(d => !d.vehicleId).map(d => ({ key: `dsp-${d.id}`, icon: 'pi pi-truck', tone: 'accent',
    description: t('home.attention.items.dispatchWithoutVehicle'), reference: d.id, site: d.projectName, priority: 'MEDIUM', to: '/despachos' })),
  ...lowStockMaterials.value.map(m => ({ key: `mat-${m.id}`, icon: 'pi pi-box', tone: 'primary',
    description: t('home.attention.items.lowStock', { material: m.name }), reference: m.id, site: m.projectName, priority: 'MEDIUM', to: '/materiales' }))
]);

const stockSegments = computed(() => [
  { key: 'in', label: t('home.inventory.inStock'), color: 'var(--color-success)', value: inventoryStore.materials.length - lowStockMaterials.value.length },
  { key: 'low', label: t('home.inventory.lowStock'), color: 'var(--color-error)', value: lowStockMaterials.value.length }
]);

const upcomingDispatches = computed(() => [...dispatchesToLeave.value, ...orderStore.dispatches.filter(d => d.status === DISPATCH_STATUS.IN_TRANSIT)]
    .sort((a, b) => `${a.departureDate} ${a.estimatedTime}`.localeCompare(`${b.departureDate} ${b.estimatedTime}`)));

const recentActivity = computed(() => activityStore.sortedRecords
    .filter(r => r.type === 'DISPATCH' || r.type === 'TRANSPORT' || r.userName === iamStore.currentUsername).slice(0, 5));
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
        <div class="vigia-card">
          <div class="card-header">
            <h2 class="m-0">{{ t('home.dispatches.title') }}</h2>
            <router-link to="/despachos" class="see-all">{{ t('home.seeAll') }}</router-link>
          </div>
          <p v-if="!upcomingDispatches.length" class="subtitle m-0">{{ t('home.dispatches.empty') }}</p>
          <ul v-else class="dispatch-list">
            <li v-for="dispatch in upcomingDispatches" :key="dispatch.id">
              <div>
                <strong>{{ dispatch.id }}</strong> · {{ dispatch.projectName }}
                <div class="subtitle small">
                  {{ t('home.dispatches.departure') }}: {{ dispatch.departureDate }} {{ dispatch.estimatedTime }} ·
                  {{ t('home.dispatches.vehicle') }}: {{ dispatch.vehiclePlate || t('dispatches.unassigned') }}
                </div>
              </div>
              <pv-tag :value="t(`dispatches.status.${dispatch.status}`)" :severity="dispatchStatusSeverity(dispatch.status)" />
            </li>
          </ul>
        </div>
      </div>
      <div class="col-12 xl:col-5 flex flex-column gap-3">
        <div class="vigia-card">
          <div class="card-header">
            <h2 class="m-0">{{ t('home.inventory.title') }}</h2>
            <router-link to="/materiales" class="see-all">{{ t('home.seeAll') }}</router-link>
          </div>
          <DonutChart :segments="stockSegments" :center-label="t('home.inventory.materials')" />
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

.dispatch-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.dispatch-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--sp-16);
  padding: var(--sp-8) 0;
  border-bottom: 1px solid var(--p-content-border-color);
}
</style>
