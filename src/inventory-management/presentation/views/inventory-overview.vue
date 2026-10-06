<script setup>
import {useI18n} from "vue-i18n";
import {computed, onMounted, ref, toRefs} from "vue";
import useInventoryManagementStore, {PERIOD} from "../../application/inventory-management.store.js";
import {MATERIAL_CATEGORY, STOCK_STATUS, stockStatusSeverity} from "../../domain/material-category.js";
import DonutChart from "../../../shared/presentation/components/donut-chart.vue";
import KpiCard from "../../../shared/presentation/components/kpi-card.vue";

const {t, locale} = useI18n();
const store = useInventoryManagementStore();
const {materials, inventoryLoading, errors, lowStockCount, categoriesCount, todayMovementsCount,
  mostUsedMaterials, withdrawalsByProject, materialsByCategory, availableMonths, period} = toRefs(store);
const {fetchInventory} = store;

onMounted(() => {
  if (!store.inventoryLoaded) fetchInventory();
});

const ALL = 'ALL';
const category = ref(ALL);
const project = ref(ALL);
const status = ref(ALL);
const onlyAlerts = ref(false);

const categoryOptions = computed(() => [{label: t('inventory.filters.allCategories'), value: ALL},
  ...Object.values(MATERIAL_CATEGORY).map(value => ({label: t(`inventory.category.${value}`), value}))]);
const projectOptions = computed(() => [{label: t('inventory.filters.allProjects'), value: ALL},
  ...[...new Set(materials.value.map(m => m.projectName))].sort().map(name => ({label: name, value: name}))]);
const statusOptions = computed(() => [{label: t('inventory.filters.allStatuses'), value: ALL},
  ...Object.values(STOCK_STATUS).map(value => ({label: t(`inventory.stockStatus.${value}`), value}))]);

const filteredMaterials = computed(() => materials.value.filter(m =>
    (category.value === ALL || m.category === category.value) &&
    (project.value === ALL || m.projectName === project.value) &&
    (status.value === ALL || m.stockStatus === status.value) &&
    (!onlyAlerts.value || m.isLowStock)));

const clearFilters = () => {
  category.value = ALL;
  project.value = ALL;
  status.value = ALL;
  onlyAlerts.value = false;
};

const kpis = computed(() => [
  {key: 'monitored', icon: 'pi pi-box', tone: 'accent', value: materials.value.length},
  {key: 'lowStock', icon: 'pi pi-exclamation-triangle', tone: 'error', value: lowStockCount.value},
  {key: 'categories', icon: 'pi pi-th-large', tone: 'primary', value: categoriesCount.value},
  {key: 'todayMovements', icon: 'pi pi-arrow-right-arrow-left', tone: 'success', value: todayMovementsCount.value}
]);

/** Period options of the consumption charts: each month with movements, the last 7 days and the whole period. */
const periodOptions = computed(() => [
  ...availableMonths.value.map(month => {
    const [year, monthIndex] = month.split('-').map(Number);
    const label = new Date(year, monthIndex - 1, 1).toLocaleString(locale.value, {month: 'long', year: 'numeric'});
    return {label: label.charAt(0).toUpperCase() + label.slice(1), value: month};
  }),
  {label: t('inventory.charts.last7Days'), value: PERIOD.LAST_7_DAYS},
  {label: t('inventory.charts.all'), value: PERIOD.ALL}
]);

const formatQuantity = (value, unit) => `${value.toLocaleString(locale.value)} ${unit}`;

/** Top five materials by outgoing quantity, with the bar length relative to the first one. */
const topMaterials = computed(() => {
  const top = mostUsedMaterials.value.slice(0, 5);
  return top.map(m => ({...m, share: top[0] ? m.quantity / top[0].quantity : 0}));
});

/** Top five projects by outgoing movements, with the bar height relative to the first one. */
const topProjects = computed(() => {
  const top = withdrawalsByProject.value.slice(0, 5);
  return top.map(p => ({...p, share: top[0] ? p.count / top[0].count : 0}));
});

/** Category colors taken from the palette tokens (src/style.css). */
const CATEGORY_COLORS = {
  [MATERIAL_CATEGORY.CEMENTS]: 'var(--color-primary-light)',
  [MATERIAL_CATEGORY.AGGREGATES]: 'var(--color-accent)',
  [MATERIAL_CATEGORY.STEEL]: 'var(--color-primary)',
  [MATERIAL_CATEGORY.INSTALLATIONS]: 'var(--color-error)',
  [MATERIAL_CATEGORY.MASONRY]: 'var(--color-success)',
  [MATERIAL_CATEGORY.ELECTRICAL]: 'color-mix(in srgb, var(--color-primary-light) 50%, var(--color-surface))',
  [MATERIAL_CATEGORY.FINISHES]: 'var(--color-text-secondary)'
};
const categorySegments = computed(() => materialsByCategory.value.map(({category, count}) => ({
  key: category, label: t(`inventory.category.${category}`), value: count, color: CATEGORY_COLORS[category]
})));
</script>

<template>
  <div class="p-4">
    <h1 class="mb-1">{{ t('inventory.title') }}</h1>
    <p class="subtitle mt-0 mb-4">{{ t('inventory.subtitle') }}</p>

    <div class="filters mb-3">
      <pv-select v-model="category" :options="categoryOptions" option-label="label" option-value="value"
                 :aria-label="t('inventory.filters.category')" class="filter" />
      <pv-select v-model="project" :options="projectOptions" option-label="label" option-value="value"
                 :aria-label="t('inventory.filters.project')" class="filter" />
      <pv-select v-model="status" :options="statusOptions" option-label="label" option-value="value"
                 :aria-label="t('inventory.filters.status')" class="filter" />
      <pv-button :label="t('inventory.filters.stockAlerts')" icon="pi pi-exclamation-triangle"
                 :class="onlyAlerts ? 'btn-primary' : 'btn-secondary'" :aria-pressed="onlyAlerts"
                 @click="onlyAlerts = !onlyAlerts" />
      <pv-button :label="t('inventory.filters.clear')" link class="clear-link" @click="clearFilters" />
    </div>

    <div class="grid mb-2">
      <div v-for="kpi in kpis" :key="kpi.key" class="col-12 md:col-6 xl:col-3">
        <KpiCard :icon="kpi.icon" :tone="kpi.tone" :label="t(`inventory.kpi.${kpi.key}`)" :value="kpi.value" />
      </div>
    </div>

    <div class="vigia-card mb-3">
      <h2 class="mt-0 mb-3">{{ t('inventory.table.title') }}</h2>
      <pv-data-table :value="filteredMaterials" :loading="inventoryLoading" data-key="id" striped-rows
                     class="p-datatable-sm" table-style="min-width: 48rem" paginator :rows="8">
        <template #empty>{{ t('inventory.table.empty') }}</template>
        <pv-column field="name" :header="t('inventory.table.material')" sortable>
          <template #body="{data}"><span class="font-semibold">{{ data.name }}</span></template>
        </pv-column>
        <pv-column :header="t('inventory.table.category')">
          <template #body="{data}">{{ t(`inventory.category.${data.category}`) }}</template>
        </pv-column>
        <pv-column field="currentStock" :header="t('inventory.table.currentStock')" sortable>
          <template #body="{data}">{{ formatQuantity(data.currentStock, data.unit) }}</template>
        </pv-column>
        <pv-column field="minimumStock" :header="t('inventory.table.minimumStock')" sortable>
          <template #body="{data}">{{ formatQuantity(data.minimumStock, data.unit) }}</template>
        </pv-column>
        <pv-column field="projectName" :header="t('inventory.table.project')" sortable />
        <pv-column :header="t('inventory.table.status')">
          <template #body="{data}">
            <pv-tag :value="t(`inventory.stockStatus.${data.stockStatus}`)" :severity="stockStatusSeverity(data.stockStatus)" />
          </template>
        </pv-column>
      </pv-data-table>
    </div>

    <div class="grid">
      <div class="col-12 lg:col-4">
        <div class="vigia-card h-full">
          <div class="chart-header">
            <h2 class="m-0">{{ t('inventory.charts.mostUsed') }}</h2>
            <pv-select v-model="period" :options="periodOptions" option-label="label" option-value="value"
                       :aria-label="t('inventory.charts.label')" class="period-select" />
          </div>
          <ul class="hbars">
            <li v-for="item in topMaterials" :key="item.materialId">
              <span class="hbar-label">{{ item.name }}</span>
              <span class="hbar-track"><span class="hbar-fill" :style="{width: `${item.share * 100}%`}" /></span>
              <span class="hbar-value">{{ formatQuantity(item.quantity, item.unit) }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="col-12 lg:col-4">
        <div class="vigia-card h-full">
          <div class="chart-header">
            <h2 class="m-0">{{ t('inventory.charts.withdrawals') }}</h2>
            <pv-select v-model="period" :options="periodOptions" option-label="label" option-value="value"
                       :aria-label="t('inventory.charts.label')" class="period-select" />
          </div>
          <div class="vbars" role="img" :aria-label="t('inventory.charts.withdrawals')">
            <div v-for="item in topProjects" :key="item.projectId" class="vbar">
              <span class="vbar-value">{{ item.count }}</span>
              <span class="vbar-fill" :style="{height: `${Math.max(item.share * 100, 4)}%`}" />
              <span class="vbar-label">{{ item.name }}</span>
            </div>
          </div>
          <small class="subtitle">{{ t('inventory.charts.withdrawalsUnit') }}</small>
        </div>
      </div>

      <div class="col-12 lg:col-4">
        <div class="vigia-card h-full">
          <h2 class="mt-0 mb-3">{{ t('inventory.charts.byCategory') }}</h2>
          <DonutChart :segments="categorySegments" :center-label="t('inventory.charts.materials')" />
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
  align-items: center;
  gap: var(--sp-16);
}

.filter {
  flex: 1;
  min-width: 12rem;
}

.chart-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: var(--sp-8);
  margin-bottom: var(--sp-16);
}

.period-select {
  min-width: 9rem;
}

.hbars {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-16);
}

.hbars li {
  display: grid;
  grid-template-columns: minmax(6rem, 1.2fr) 2fr auto;
  align-items: center;
  gap: var(--sp-8);
}

.hbar-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hbar-track {
  height: 8px;
  border-radius: 4px;
  background-color: var(--p-content-border-color);
  overflow: hidden;
}

.hbar-fill {
  display: block;
  height: 100%;
  border-radius: 4px;
  background-color: var(--color-accent);
}

.hbar-value {
  font-weight: 600;
  white-space: nowrap;
}

.vbars {
  display: flex;
  align-items: flex-end;
  gap: var(--sp-16);
  height: 180px;
  margin-bottom: var(--sp-8);
}

.vbar {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: var(--sp-4);
  min-width: 0;
}

.vbar-value {
  font-weight: 700;
}

.vbar-fill {
  width: 100%;
  max-width: 3.5rem;
  border-radius: 4px 4px 0 0;
  background-color: var(--color-success);
}

.vbar-label {
  font-size: 12px;
  text-align: center;
  color: var(--color-text-secondary);
  line-height: 1.2;
  min-height: 2.4em;
}
</style>
