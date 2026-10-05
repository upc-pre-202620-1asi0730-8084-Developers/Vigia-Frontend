<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDispatchStore } from '../../application/dispatch.store.js';
import { useOrderStore } from '../../application/order.store.js';
import Stepper from 'primevue/stepper';
import StepList from 'primevue/steplist';
import Step from 'primevue/step';
import { DISPATCH_TYPE, DISPATCH_PRIORITY } from '../../domain/dispatch-status.js';
import { ORDER_STATUS } from '../../domain/order-status.js';

const { t } = useI18n();
const router = useRouter();
const dispatchStore = useDispatchStore();
const orderStore = useOrderStore();

// El asistente de Nuevo Despacho tiene 4 pasos; en este alcance se implementa el Paso 1 (Information).
const steps = ['information', 'materials', 'transportation', 'confirmation'];
const currentStep = 1;

const submitting = ref(false);
const submitted = ref(false);

const form = reactive({
  projectName: '',
  relatedOrderId: null,
  departureDate: '',
  estimatedTime: '',
  dispatchType: DISPATCH_TYPE.DEPARTURE_TO_WORK,
  priority: DISPATCH_PRIORITY.AVERAGE,
  observations: ''
});

onMounted(() => {
  if (!orderStore.orders.length) orderStore.loadOrders();
});

const approvedOrders = computed(() =>
  orderStore.orders
    .filter(o => o.status === ORDER_STATUS.APPROVED)
    .map(o => ({ label: `${o.id} — ${o.projectName}`, value: o.id, projectName: o.projectName }))
);

const dispatchTypeOptions = computed(() =>
  Object.values(DISPATCH_TYPE).map(value => ({ label: t(`dispatches.types.${value}`), value }))
);

const priorityOptions = computed(() =>
  Object.values(DISPATCH_PRIORITY).map(value => ({ label: t(`dispatches.priority.${value}`), value }))
);

function onRelatedOrderChange(orderId) {
  const match = approvedOrders.value.find(o => o.value === orderId);
  if (match && !form.projectName) form.projectName = match.projectName;
}

const isValid = computed(() =>
  form.projectName.trim() && form.departureDate && form.estimatedTime && form.dispatchType
);

async function submit() {
  submitted.value = true;
  if (!isValid.value) return;
  submitting.value = true;
  const created = await dispatchStore.createDispatch({ ...form });
  submitting.value = false;
  if (created) router.push('/despachos');
}

function cancel() {
  router.push('/despachos');
}
</script>

<template>
  <section class="new-dispatch">
    <header>
      <h1 class="m-0">{{ t('dispatches.new.title') }}</h1>
      <p class="subtitle m-0">{{ t('dispatches.new.subtitle') }}</p>
    </header>

    <!-- Indicador de pasos del asistente -->
    <Stepper :value="currentStep">
      <StepList>
        <Step v-for="(step, index) in steps" :key="step" :value="index + 1">
          {{ t(`dispatches.new.steps.${step}`) }}
        </Step>
      </StepList>
    </Stepper>

    <pv-card>
      <template #content>
        <h3 class="section-title">{{ t('dispatches.new.infoTitle') }}</h3>
        <p class="subtitle">{{ t('dispatches.new.infoSubtitle') }}</p>

        <div class="form-grid">
          <div class="field">
            <label>{{ t('dispatches.new.work') }} *</label>
            <pv-input-text v-model="form.projectName" class="w-full"
                           :class="{ 'input-error': submitted && !form.projectName.trim() }"
                           :placeholder="t('dispatches.new.workPlaceholder')" />
          </div>

          <div class="field">
            <label>{{ t('dispatches.new.relatedOrder') }}</label>
            <pv-select v-model="form.relatedOrderId" :options="approvedOrders" option-label="label" option-value="value"
                       class="w-full" show-clear :placeholder="t('dispatches.new.relatedOrderPlaceholder')"
                       @change="onRelatedOrderChange(form.relatedOrderId)" />
          </div>

          <div class="field">
            <label>{{ t('dispatches.new.departureDate') }} *</label>
            <pv-input-text v-model="form.departureDate" type="date" class="w-full"
                           :class="{ 'input-error': submitted && !form.departureDate }" />
          </div>

          <div class="field">
            <label>{{ t('dispatches.new.estimatedTime') }} *</label>
            <pv-input-text v-model="form.estimatedTime" type="time" class="w-full"
                           :class="{ 'input-error': submitted && !form.estimatedTime }" />
          </div>

          <div class="field">
            <label>{{ t('dispatches.new.dispatchType') }} *</label>
            <pv-select v-model="form.dispatchType" :options="dispatchTypeOptions" option-label="label" option-value="value"
                       class="w-full" />
          </div>

          <div class="field">
            <label>{{ t('dispatches.new.priority') }}</label>
            <pv-select v-model="form.priority" :options="priorityOptions" option-label="label" option-value="value"
                       class="w-full" />
          </div>

          <div class="field field-full">
            <label>{{ t('dispatches.new.observations') }}</label>
            <pv-textarea v-model="form.observations" rows="3" class="w-full" :maxlength="500"
                         :placeholder="t('dispatches.new.observationsPlaceholder')" />
          </div>
        </div>

        <p v-if="submitted && !isValid" class="error-message">{{ t('dispatches.new.validationError') }}</p>
      </template>
    </pv-card>

    <div class="actions">
      <pv-button :label="t('common.cancel')" outlined @click="cancel" />
      <pv-button :label="t('dispatches.new.create')" icon="pi pi-check" icon-pos="right"
                 :loading="submitting" @click="submit" />
    </div>
  </section>
</template>

<style scoped>
.new-dispatch { width: 100%; display: flex; flex-direction: column; gap: var(--sp-16); }
.new-dispatch, .new-dispatch :deep(.p-card), .new-dispatch :deep(.p-step), .new-dispatch :deep(.p-step-title) { color: var(--color-text-main); }
.new-dispatch :deep(.p-button:not(.p-button-outlined):not(.p-button-text)) { color: #fff; }
.new-dispatch :deep(.p-card) { }
.subtitle { opacity: 0.7; font-size: 14px; margin-top: 4px; }


.section-title { margin-bottom: 4px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-16); margin-top: var(--sp-16); }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; font-weight: 500; }
.field-full { grid-column: 1 / -1; }

.actions { display: flex; justify-content: flex-end; gap: var(--sp-16); }

@media (max-width: 760px) { .form-grid { grid-template-columns: 1fr; } }
</style>
