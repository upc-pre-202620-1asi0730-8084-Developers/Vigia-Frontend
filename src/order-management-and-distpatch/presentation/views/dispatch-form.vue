<script setup>
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import {computed, onMounted, ref} from "vue";
import useOrderManagementStore from "../../application/order-management.store.js";
import {Dispatch} from "../../domain/model/dispatch.entity.js";
import {DISPATCH_PRIORITY, DISPATCH_STATUS, DISPATCH_TYPE} from "../../domain/dispatch-status.js";
import {ORDER_STATUS} from "../../domain/order-status.js";

const {t} = useI18n();
const router = useRouter();
const store = useOrderManagementStore();
const {errors, addDispatch, fetchOrders, fetchDispatches} = store;

const steps = ['information', 'materials', 'transportation', 'confirmation'];
const form = ref({
  projectName: '', relatedOrderId: null, departureDate: '', estimatedTime: '',
  dispatchType: DISPATCH_TYPE.DEPARTURE_TO_WORK, priority: DISPATCH_PRIORITY.AVERAGE, observations: ''
});

const approvedOrders = computed(() => store.orders
    .filter(order => order.status === ORDER_STATUS.APPROVED)
    .map(order => ({label: `${order.id} — ${order.projectName}`, value: order.id})));
const typeOptions = computed(() => Object.values(DISPATCH_TYPE).map(value => ({label: t(`dispatches.types.${value}`), value})));
const priorityOptions = computed(() => Object.values(DISPATCH_PRIORITY).map(value => ({label: t(`dispatches.priority.${value}`), value})));

onMounted(() => {
  if (!store.ordersLoaded) fetchOrders();
  if (!store.dispatchesLoaded) fetchDispatches();
});

const saveDispatch = () => {
  /**
   * Saves the dispatch as a new dispatch in preparation.
   */
  const dispatch = new Dispatch({
    id: store.nextDispatchId(),
    ...form.value,
    status: DISPATCH_STATUS.IN_PREPARATION,
    createdBy: 'Carlos Mendoza',
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
  });
  addDispatch(dispatch);
  navigateBack();
};

/**
 * Navigates back to the dispatches list.
 */
const navigateBack = () => {
  router.push({name: 'ordering-dispatches'});
};
</script>

<template>
  <div class="p-4">
    <h1>{{ t('dispatches.new.title') }}</h1>
    <pv-stepper :value="1" class="mb-3">
      <pv-step-list>
        <pv-step v-for="(step, index) in steps" :key="step" :value="index + 1">{{ t(`dispatches.new.steps.${step}`) }}</pv-step>
      </pv-step-list>
    </pv-stepper>
    <form @submit.prevent="saveDispatch">
      <div class="field mb-3">
        <label for="work">{{ t('dispatches.new.work') }} *</label>
        <pv-input-text id="work" v-model="form.projectName" required class="w-full" :placeholder="t('dispatches.new.workPlaceholder')" />
      </div>
      <div class="field mb-3">
        <label for="order">{{ t('dispatches.new.relatedOrder') }}</label>
        <pv-select id="order" v-model="form.relatedOrderId" :options="approvedOrders" optionLabel="label" optionValue="value"
                   showClear class="w-full" :placeholder="t('dispatches.new.relatedOrderPlaceholder')" />
      </div>
      <div class="field mb-3">
        <label for="date">{{ t('dispatches.new.departureDate') }} *</label>
        <pv-input-text id="date" v-model="form.departureDate" type="date" required class="w-full" />
      </div>
      <div class="field mb-3">
        <label for="time">{{ t('dispatches.new.estimatedTime') }} *</label>
        <pv-input-text id="time" v-model="form.estimatedTime" type="time" required class="w-full" />
      </div>
      <div class="field mb-3">
        <label for="type">{{ t('dispatches.new.dispatchType') }} *</label>
        <pv-select id="type" v-model="form.dispatchType" :options="typeOptions" optionLabel="label" optionValue="value" class="w-full" />
      </div>
      <div class="field mb-3">
        <label for="priority">{{ t('dispatches.new.priority') }}</label>
        <pv-select id="priority" v-model="form.priority" :options="priorityOptions" optionLabel="label" optionValue="value" class="w-full" />
      </div>
      <div class="field mb-3">
        <label for="observations">{{ t('dispatches.new.observations') }}</label>
        <pv-textarea id="observations" v-model="form.observations" rows="3" maxlength="500" class="w-full"
                     :placeholder="t('dispatches.new.observationsPlaceholder')" />
      </div>
      <pv-button type="submit" :label="t('dispatches.new.create')" icon="pi pi-save" class="btn-primary" />
      <pv-button :label="t('common.cancel')" severity="secondary" class="ml-2" @click="navigateBack" />
    </form>
    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>
  </div>
</template>

<style scoped>
:deep(.p-step-title) { color: var(--color-text-main); }
</style>
