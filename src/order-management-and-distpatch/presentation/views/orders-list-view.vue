<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useOrderStore } from '../../application/order.store.js';
import { ORDER_STATUS, ORDER_PRIORITY, orderStatusSeverity, orderPrioritySeverity } from '../../domain/order-status.js';

const { t } = useI18n();
const router = useRouter();
const orderStore = useOrderStore();

const searchQuery = ref('');
const selectedStatus = ref('ALL');
const selectedProject = ref('ALL');

onMounted(() => {
  orderStore.loadOrders();
});

const statusOptions = computed(() => [
  { label: t('orders.filters.all'), value: 'ALL' },
  ...Object.values(ORDER_STATUS).map(value => ({ label: t(`orders.status.${value}`), value }))
]);

const projectOptions = computed(() => {
  const projects = [...new Set(orderStore.orders.map(o => o.projectName))];
  return [{ label: t('orders.filters.all'), value: 'ALL' }, ...projects.map(p => ({ label: p, value: p }))];
});

const filteredOrders = computed(() => {
  return orderStore.orders.filter(order => {
    const matchesStatus = selectedStatus.value === 'ALL' || order.status === selectedStatus.value;
    const matchesProject = selectedProject.value === 'ALL' || order.projectName === selectedProject.value;
    const q = searchQuery.value.trim().toLowerCase();
    const matchesQuery = !q
      || order.id.toLowerCase().includes(q)
      || order.projectName.toLowerCase().includes(q)
      || order.mainMaterial.toLowerCase().includes(q);
    return matchesStatus && matchesProject && matchesQuery;
  });
});

function clearFilters() {
  searchQuery.value = '';
  selectedStatus.value = 'ALL';
  selectedProject.value = 'ALL';
}

function openDetail(order) {
  router.push(`/solicitudes/${order.id}`);
}

const attentionOrders = computed(() =>
  orderStore.orders.filter(o => o.priority === ORDER_PRIORITY.HIGH || o.status === ORDER_STATUS.UNDER_REVIEW).slice(0, 4)
);
</script>

<template>
  <section class="orders-view">
    <header class="view-header">
      <div>
        <h1 class="m-0">{{ t('orders.title') }}</h1>
        <p class="subtitle m-0">{{ t('orders.subtitle') }}</p>
      </div>
    </header>

    <!-- KPIs -->
    <div class="kpi-grid">
      <pv-card class="kpi-card">
        <template #content>
          <span class="kpi-label"><i class="pi pi-clock mr-2" />{{ t('orders.kpi.pending') }}</span>
          <div class="kpi-value">{{ orderStore.pendingCount }}</div>
        </template>
      </pv-card>
      <pv-card class="kpi-card">
        <template #content>
          <span class="kpi-label"><i class="pi pi-check-circle mr-2" />{{ t('orders.kpi.approved') }}</span>
          <div class="kpi-value">{{ orderStore.approvedCount }}</div>
        </template>
      </pv-card>
      <pv-card class="kpi-card">
        <template #content>
          <span class="kpi-label"><i class="pi pi-search mr-2" />{{ t('orders.kpi.underReview') }}</span>
          <div class="kpi-value">{{ orderStore.underReviewCount }}</div>
        </template>
      </pv-card>
      <pv-card class="kpi-card">
        <template #content>
          <span class="kpi-label"><i class="pi pi-exclamation-triangle mr-2" />{{ t('orders.kpi.urgent') }}</span>
          <div class="kpi-value">{{ orderStore.urgentCount }}</div>
        </template>
      </pv-card>
    </div>

    <!-- Filtros -->
    <pv-card class="filters-card">
      <template #content>
        <div class="filters-row">
          <pv-icon-field class="flex-1">
            <pv-input-icon class="pi pi-search" />
            <pv-input-text v-model="searchQuery" :placeholder="t('orders.filters.search')" class="w-full" />
          </pv-icon-field>
          <pv-select v-model="selectedStatus" :options="statusOptions" option-label="label" option-value="value"
                     :placeholder="t('orders.filters.status')" class="filter-select" />
          <pv-select v-model="selectedProject" :options="projectOptions" option-label="label" option-value="value"
                     :placeholder="t('orders.filters.work')" class="filter-select" />
          <pv-button :label="t('orders.filters.clean')" icon="pi pi-filter-slash" text @click="clearFilters" />
        </div>
      </template>
    </pv-card>

    <div class="content-grid">
      <!-- Tabla -->
      <pv-card class="list-card">
        <template #content>
          <h3 class="section-title">{{ t('orders.listTitle') }}</h3>
          <pv-data-table :value="filteredOrders" :loading="orderStore.loading" data-key="id"
                         paginator :rows="8" responsive-layout="scroll" class="orders-table"
                         selection-mode="single" @row-click="openDetail($event.data)">
            <pv-column field="id" :header="t('orders.table.id')" />
            <pv-column field="projectName" :header="t('orders.table.work')" />
            <pv-column field="mainMaterial" :header="t('orders.table.materials')" />
            <pv-column :header="t('orders.table.quantity')">
              <template #body="{ data }">{{ data.totalQuantity }}</template>
            </pv-column>
            <pv-column field="date" :header="t('orders.table.date')" />
            <pv-column :header="t('orders.table.status')">
              <template #body="{ data }">
                <pv-tag :value="t(`orders.status.${data.status}`)" :severity="orderStatusSeverity(data.status)" />
              </template>
            </pv-column>
            <pv-column :header="t('orders.table.priority')">
              <template #body="{ data }">
                <pv-tag :value="t(`orders.priority.${data.priority}`)" :severity="orderPrioritySeverity(data.priority)" />
              </template>
            </pv-column>
            <pv-column :header="t('common.actions')">
              <template #body="{ data }">
                <pv-button icon="pi pi-eye" text rounded :aria-label="t('common.viewDetails')"
                           @click.stop="openDetail(data)" />
              </template>
            </pv-column>
          </pv-data-table>
        </template>
      </pv-card>

      <!-- Panel "Requires attention" -->
      <pv-card class="attention-card">
        <template #content>
          <h3 class="section-title">{{ t('orders.attentionTitle') }}</h3>
          <ul class="attention-list">
            <li v-for="order in attentionOrders" :key="order.id" @click="openDetail(order)">
              <div class="flex align-items-center justify-content-between">
                <strong>{{ order.id }}</strong>
                <pv-tag :value="t(`orders.priority.${order.priority}`)" :severity="orderPrioritySeverity(order.priority)" />
              </div>
              <div class="attention-project">{{ order.projectName }}</div>
              <small>{{ order.mainMaterial }}</small>
            </li>
            <li v-if="!attentionOrders.length" class="empty">{{ t('orders.attentionEmpty') }}</li>
          </ul>
        </template>
      </pv-card>
    </div>
  </section>
</template>

<style scoped>
.orders-view { width: 100%; display: flex; flex-direction: column; gap: var(--sp-16); }
.orders-view :deep(.p-card) { color: var(--color-text-main); }
.view-header { display: flex; justify-content: space-between; align-items: flex-start; }
.subtitle { color: var(--color-text-secondary); font-size: 14px; margin-top: 4px; }

.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-16); }
.kpi-card :deep(.p-card-content) { padding: var(--sp-8) 0; }
.kpi-label { color: var(--color-text-secondary); font-size: 13px; font-weight: 500; display: flex; align-items: center; }
.kpi-value { font-size: 28px; font-weight: 700; color: var(--color-primary); margin-top: var(--sp-8); }

.filters-row { display: flex; gap: var(--sp-16); align-items: center; flex-wrap: wrap; }
.flex-1 { flex: 1 1 240px; }
.filter-select { min-width: 180px; }

.content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: var(--sp-16); align-items: start; }
.section-title { color: var(--color-primary); margin-bottom: var(--sp-16); }
.orders-table :deep(tr) { cursor: pointer; }

.attention-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--sp-8); }
.attention-list li { border: 1px solid #E5E7EB; border-radius: var(--radius-actionable); padding: var(--sp-8) var(--sp-16); cursor: pointer; transition: background var(--transition-default); }
.attention-list li:hover { background: var(--color-bg); }
.attention-project { font-weight: 500; margin: 2px 0; }
.attention-list .empty { text-align: center; color: var(--color-text-secondary); cursor: default; }

@media (max-width: 1100px) { .content-grid { grid-template-columns: 1fr; } }
@media (max-width: 900px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .kpi-grid { grid-template-columns: 1fr; } }
</style>
