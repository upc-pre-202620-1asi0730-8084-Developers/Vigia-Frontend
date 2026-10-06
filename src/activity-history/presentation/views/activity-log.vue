<script setup>
import {useI18n} from "vue-i18n";
import {computed, onMounted, ref, toRefs} from "vue";
import useActivityHistoryStore from "../../application/activity-history.store.js";
import {ACTIVITY_TYPE, ACTIVITY_TYPE_ICON, activityStatusSeverity} from "../../domain/activity-type.js";

const {t, locale} = useI18n();
const store = useActivityHistoryStore();
const {sortedRecords, recordsLoading, errors, userNames} = toRefs(store);
const {fetchRecords} = store;

onMounted(() => {
  if (!store.recordsLoaded) fetchRecords();
});

const ALL = 'ALL';
const fromDate = ref('');
const toDate = ref('');
const type = ref(ALL);
const user = ref(ALL);
const reference = ref('');

const typeOptions = computed(() => [{label: t('history.filters.allTypes'), value: ALL},
  ...Object.values(ACTIVITY_TYPE).map(value => ({label: t(`history.type.${value}`), value}))]);
const userOptions = computed(() => [{label: t('history.filters.allUsers'), value: ALL},
  ...userNames.value.map(name => ({label: name, value: name}))]);

const filteredRecords = computed(() => {
  const q = reference.value.trim().toLowerCase();
  return sortedRecords.value.filter(r =>
      (!fromDate.value || r.localDate >= fromDate.value) &&
      (!toDate.value || r.localDate <= toDate.value) &&
      (type.value === ALL || r.type === type.value) &&
      (user.value === ALL || r.userName === user.value) &&
      (!q || r.reference.toLowerCase().includes(q)));
});

const clearFilters = () => {
  fromDate.value = '';
  toDate.value = '';
  type.value = ALL;
  user.value = ALL;
  reference.value = '';
};

/** @param {string} iso - ISO timestamp. */
const formatDateTime = iso => new Date(iso).toLocaleString(locale.value, {dateStyle: 'short', timeStyle: 'short'});
</script>

<template>
  <div class="p-4">
    <h1 class="mb-1">{{ t('history.title') }}</h1>
    <p class="subtitle mt-0 mb-4">{{ t('history.subtitle') }}</p>

    <div class="vigia-card filters mb-3">
      <div class="filter date-range">
        <span class="filter-label">{{ t('history.filters.dateRange') }}</span>
        <div class="flex align-items-center gap-2">
          <pv-input-text v-model="fromDate" type="date" :aria-label="t('history.filters.from')" class="w-full" />
          <span aria-hidden="true">–</span>
          <pv-input-text v-model="toDate" type="date" :aria-label="t('history.filters.to')" class="w-full" />
        </div>
      </div>
      <div class="filter">
        <label for="history-type-filter" class="filter-label">{{ t('history.filters.type') }}</label>
        <pv-select v-model="type" input-id="history-type-filter" :options="typeOptions" option-label="label" option-value="value" />
      </div>
      <div class="filter">
        <label for="history-user-filter" class="filter-label">{{ t('history.filters.user') }}</label>
        <pv-select v-model="user" input-id="history-user-filter" :options="userOptions" option-label="label" option-value="value" />
      </div>
      <div class="filter">
        <label for="history-reference-filter" class="filter-label">{{ t('history.filters.reference') }}</label>
        <pv-input-text id="history-reference-filter" v-model="reference" :placeholder="t('history.filters.searchReference')" />
      </div>
      <pv-button :label="t('history.filters.clear')" icon="pi pi-filter-slash" class="btn-accent" @click="clearFilters" />
    </div>

    <div class="vigia-card">
      <div class="card-header">
        <h2 class="m-0">{{ t('history.log.title') }}</h2>
        <span class="subtitle">{{ t('history.log.showing', {count: filteredRecords.length, total: sortedRecords.length}) }}</span>
      </div>
      <pv-data-table :value="filteredRecords" :loading="recordsLoading" data-key="id" striped-rows
                     class="p-datatable-sm" table-style="min-width: 52rem"
                     paginator :rows="10" :rows-per-page-options="[10, 20, 50]">
        <template #empty>{{ t('history.log.empty') }}</template>
        <pv-column field="occurredAt" :header="t('history.table.dateTime')" sortable>
          <template #body="{data}">{{ formatDateTime(data.occurredAt) }}</template>
        </pv-column>
        <pv-column :header="t('history.table.type')">
          <template #body="{data}">
            <span class="type-cell" :class="`type-${data.type.toLowerCase()}`">
              <i :class="ACTIVITY_TYPE_ICON[data.type]" aria-hidden="true" />{{ t(`history.type.${data.type}`) }}
            </span>
          </template>
        </pv-column>
        <pv-column :header="t('history.table.description')">
          <template #body="{data}">{{ t(`history.action.${data.action}`, {detail: data.detail}) }}</template>
        </pv-column>
        <pv-column field="userName" :header="t('history.table.user')" sortable />
        <pv-column field="reference" :header="t('history.table.reference')" sortable>
          <template #body="{data}"><span class="font-semibold">{{ data.reference }}</span></template>
        </pv-column>
        <pv-column :header="t('history.table.status')">
          <template #body="{data}">
            <pv-tag :value="t(`history.status.${data.status}`)" :severity="activityStatusSeverity(data.status)" />
          </template>
        </pv-column>
      </pv-data-table>
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
  min-width: 11rem;
}

.date-range {
  flex: 1.6;
  min-width: 18rem;
}

.filter-label {
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

.type-cell {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-8);
}

.type-dispatch .pi,
.type-transport .pi {
  color: var(--color-primary);
}

.type-reception .pi {
  color: var(--color-success);
}

.type-discrepancy .pi {
  color: var(--color-error);
}
</style>
