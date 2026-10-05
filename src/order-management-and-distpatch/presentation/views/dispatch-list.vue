<script setup>
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import {computed, onMounted, ref, toRefs} from "vue";
import useOrderManagementStore from "../../application/order-management.store.js";
import {DISPATCH_STATUS, dispatchStatusSeverity} from "../../domain/dispatch-status.js";

const {t} = useI18n();
const router = useRouter();
const store = useOrderManagementStore();
const {dispatches, dispatchesLoaded, errors, inPreparationCount, scheduledCount, inTransitCount, withIncidentCount} = toRefs(store);
const {fetchDispatches} = store;

const search = ref('');
const status = ref('ALL');
const statusOptions = computed(() => [
  {label: t('dispatches.filters.all'), value: 'ALL'},
  ...Object.values(DISPATCH_STATUS).map(value => ({label: t(`dispatches.status.${value}`), value}))
]);

const filteredDispatches = computed(() => dispatches.value.filter(dispatch => {
  const q = search.value.trim().toLowerCase();
  const matchesStatus = status.value === 'ALL' || dispatch.status === status.value;
  const matchesSearch = !q || [dispatch.id, dispatch.projectName, dispatch.items[0]?.material || ''].some(v => String(v).toLowerCase().includes(q));
  return matchesStatus && matchesSearch;
}));

onMounted(() => {
  if (!store.dispatchesLoaded) fetchDispatches();
});

/**
 * Navigate to the new dispatch page.
 */
const navigateToNew = () => {
  router.push({ name: 'ordering-dispatch-new' });
};

/** @param {Dispatch} dispatch - Dispatch whose first line is summarized. */
const mainQuantity = (dispatch) => {
  const main = dispatch.items[0];
  return main ? `${main.quantity} ${main.unit}${dispatch.items.length > 1 ? ` +${dispatch.items.length - 1}` : ''}` : '—';
};
</script>

<template>
  <div class="p-4">
    <h1>{{ t('dispatches.title') }}</h1>
    <pv-button :label="t('dispatches.newButton')" icon="pi pi-plus" class="mb-3 btn-primary" @click="navigateToNew" />
    <div class="grid mb-3">
      <div class="col-12 md:col-3"><div class="border-1 surface-border border-round p-3"><i class="pi pi-box mr-2" />{{ t('dispatches.kpi.inPreparation') }}<h2 class="m-0 mt-2">{{ inPreparationCount }}</h2></div></div>
      <div class="col-12 md:col-3"><div class="border-1 surface-border border-round p-3"><i class="pi pi-calendar mr-2" />{{ t('dispatches.kpi.scheduled') }}<h2 class="m-0 mt-2">{{ scheduledCount }}</h2></div></div>
      <div class="col-12 md:col-3"><div class="border-1 surface-border border-round p-3"><i class="pi pi-send mr-2" />{{ t('dispatches.kpi.inTransit') }}<h2 class="m-0 mt-2">{{ inTransitCount }}</h2></div></div>
      <div class="col-12 md:col-3"><div class="border-1 surface-border border-round p-3"><i class="pi pi-exclamation-triangle mr-2" />{{ t('dispatches.kpi.withIncident') }}<h2 class="m-0 mt-2">{{ withIncidentCount }}</h2></div></div>
    </div>
    <div class="flex gap-3 mb-3">
      <pv-icon-field class="flex-1">
        <pv-input-icon class="pi pi-search" />
        <pv-input-text v-model="search" :placeholder="t('dispatches.filters.search')" class="w-full" />
      </pv-icon-field>
      <pv-select v-model="status" :options="statusOptions" optionLabel="label" optionValue="value" />
    </div>
    <pv-data-table
        :value="filteredDispatches"
        :loading="!dispatchesLoaded"
        striped-rows
        table-style="min-width: 50rem"
        paginator
        :rows="5"
        :rows-per-page-options="[5, 10, 20]"
    >
      <pv-column field="id" :header="t('dispatches.table.id')" sortable />
      <pv-column field="projectName" :header="t('dispatches.table.work')" sortable />
      <pv-column :header="t('dispatches.table.materials')">
        <template #body="slotProps">{{ slotProps.data.items[0]?.material || '—' }}</template>
      </pv-column>
      <pv-column :header="t('dispatches.table.quantity')">
        <template #body="slotProps">{{ mainQuantity(slotProps.data) }}</template>
      </pv-column>
      <pv-column :header="t('dispatches.table.transport')">
        <template #body="slotProps">{{ slotProps.data.vehiclePlate || t('dispatches.unassigned') }}</template>
      </pv-column>
      <pv-column :header="t('dispatches.table.exit')">
        <template #body="slotProps">{{ slotProps.data.departureDate }} · {{ slotProps.data.estimatedTime }}</template>
      </pv-column>
      <pv-column :header="t('dispatches.table.status')">
        <template #body="slotProps">
          <pv-tag :value="t(`dispatches.status.${slotProps.data.status}`)" :severity="dispatchStatusSeverity(slotProps.data.status)" />
        </template>
      </pv-column>
    </pv-data-table>
    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>
  </div>
</template>

<style scoped>

</style>
