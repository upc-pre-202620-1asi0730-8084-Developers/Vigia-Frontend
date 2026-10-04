<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useReceptionStore } from '../../application/reception.store.js';
import useIamStore from '../../../iam/application/iam.store.js';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  preselectedArrival: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:visible', 'saved']);

const { t } = useI18n();
const receptionStore = useReceptionStore();
const iamStore = useIamStore();

const isSubmitting = ref(false);
const errorMessage = ref('');

const selectedArrivalId = ref(null);

const form = reactive({
  siteName: 'Torre A',
  origin: '',
  dispatchId: '',
  deliveryGuideNumber: '',
  truckPlate: '',
  driverName: '',
  observations: '',
  checklist: {
    materialGoodCondition: true,
    quantityVerified: true,
    deliveryGuideReceived: true,
    photographicEvidence: false,
    observationsRecorded: false
  },
  items: [
    {
      id: 1,
      materialName: 'Cemento Portland',
      dispatchedQuantity: 100,
      receivedQuantity: 100,
      unit: 'sacks'
    }
  ]
});

// Opciones de despachos próximos en tránsito
const arrivalOptions = computed(() => {
  return receptionStore.upcomingArrivals.map(a => ({
    label: `${a.id || a.dispatchId} - ${a.material} (${a.origin})`,
    value: a.id || a.dispatchId,
    arrival: a
  }));
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    errorMessage.value = '';
    if (props.preselectedArrival) {
      applyArrival(props.preselectedArrival);
    } else if (receptionStore.upcomingArrivals.length > 0) {
      applyArrival(receptionStore.upcomingArrivals[0]);
    }
  }
});

function applyArrival(arrival) {
  if (!arrival) return;
  selectedArrivalId.value = arrival.id || arrival.dispatchId;
  form.origin = arrival.origin || '';
  form.dispatchId = arrival.dispatchId || arrival.id || '';
  form.deliveryGuideNumber = arrival.deliveryGuideNumber || `GR-${Math.floor(10000 + Math.random() * 90000)}`;
  form.truckPlate = arrival.truckPlate || arrival.truck || 'TR-315';
  form.driverName = arrival.driverName || 'Carlos Mendoza';
  form.siteName = arrival.siteName || 'Torre A';

  form.items = [
    {
      id: 1,
      materialName: arrival.material || 'Material en tránsito',
      dispatchedQuantity: arrival.dispatchedQuantity || 24,
      receivedQuantity: arrival.dispatchedQuantity || 24,
      unit: arrival.unit || 't'
    }
  ];
}

function onArrivalSelect(e) {
  const chosen = receptionStore.upcomingArrivals.find(a => (a.id || a.dispatchId) === e.value);
  if (chosen) {
    applyArrival(chosen);
  }
}

function addItem() {
  form.items.push({
    id: Date.now(),
    materialName: '',
    dispatchedQuantity: 10,
    receivedQuantity: 10,
    unit: 't'
  });
}

function removeItem(index) {
  if (form.items.length > 1) {
    form.items.splice(index, 1);
  }
}

async function onSubmit() {
  if (!form.dispatchId || !form.deliveryGuideNumber) {
    errorMessage.value = t('receptions.dialog.requiredFields');
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const payload = {
      dispatchId: form.dispatchId,
      verifiedByUserId: iamStore.companyId,
      verifiedByUserName: iamStore.currentUsername,
      siteName: form.siteName,
      origin: form.origin,
      truckPlate: form.truckPlate,
      driverName: form.driverName,
      deliveryGuideNumber: form.deliveryGuideNumber,
      arrivedAt: new Date().toISOString(),
      observations: form.observations,
      checklist: { ...form.checklist },
      items: form.items.map(item => ({
        materialName: item.materialName,
        dispatchedQuantity: Number(item.dispatchedQuantity),
        receivedQuantity: Number(item.receivedQuantity),
        unit: item.unit
      }))
    };

    const newReception = await receptionStore.registerReception(payload);
    emit('saved', newReception);
    emit('update:visible', false);
  } catch (err) {
    errorMessage.value = err.message || t('receptions.dialog.errorSaving');
  } finally {
    isSubmitting.value = false;
  }
}

function closeDialog() {
  emit('update:visible', false);
}
</script>

<template>
  <pv-dialog
    :visible="visible"
    modal
    :header="t('receptions.dialog.registerTitle')"
    :style="{ width: '90vw', maxWidth: '780px' }"
    @update:visible="closeDialog"
  >
    <div class="register-dialog-content">
      <div v-if="errorMessage" class="error-banner mb-3">
        <i class="pi pi-exclamation-triangle mr-2"></i>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Selector de Despacho en camino -->
      <div class="form-section mb-4">
        <label class="section-label">
          <i class="pi pi-truck mr-1 text-primary"></i>
          {{ t('receptions.dialog.selectArrival') }}
        </label>
        <pv-select
          v-model="selectedArrivalId"
          :options="arrivalOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Seleccionar despacho en camino..."
          class="w-full"
          @change="onArrivalSelect"
        />
        <small class="caption">{{ t('receptions.dialog.selectArrivalHelp') }}</small>
      </div>

      <!-- Datos del Despacho y Transporte -->
      <div class="grid grid-nogutter form-grid mb-3">
        <div class="col-12 md:col-6 pr-md-2 mb-3">
          <label class="field-label">{{ t('receptions.dialog.dispatchId') }} *</label>
          <pv-input-text v-model="form.dispatchId" class="w-full" placeholder="Ej. TR-315 o DES-250" />
        </div>
        <div class="col-12 md:col-6 pl-md-2 mb-3">
          <label class="field-label">{{ t('receptions.dialog.deliveryGuide') }} *</label>
          <pv-input-text v-model="form.deliveryGuideNumber" class="w-full" placeholder="Ej. GR-78452" />
        </div>

        <div class="col-12 md:col-6 pr-md-2 mb-3">
          <label class="field-label">{{ t('receptions.dialog.origin') }}</label>
          <pv-input-text v-model="form.origin" class="w-full" placeholder="Ej. Cantera Los Pinos / Cemex" />
        </div>
        <div class="col-12 md:col-6 pl-md-2 mb-3">
          <label class="field-label">{{ t('receptions.dialog.site') }}</label>
          <pv-input-text v-model="form.siteName" class="w-full" placeholder="Ej. Torre A / Planta Norte" />
        </div>

        <div class="col-12 md:col-6 pr-md-2 mb-3">
          <label class="field-label">{{ t('receptions.dialog.truckPlate') }}</label>
          <pv-input-text v-model="form.truckPlate" class="w-full" placeholder="Ej. TR-315 (AB-123-CD)" />
        </div>
        <div class="col-12 md:col-6 pl-md-2 mb-3">
          <label class="field-label">{{ t('receptions.dialog.driver') }}</label>
          <pv-input-text v-model="form.driverName" class="w-full" placeholder="Ej. Carlos Mendoza" />
        </div>
      </div>

      <!-- Ítems y Cantidades a Cotejar -->
      <div class="items-section mb-4">
        <div class="flex justify-content-between align-items-center mb-2">
          <label class="section-label m-0">
            <i class="pi pi-box mr-1 text-primary"></i>
            {{ t('receptions.dialog.itemsToVerify') }}
          </label>
          <pv-button
            icon="pi pi-plus"
            :label="t('receptions.dialog.addItem')"
            class="p-button-sm btn-secondary"
            @click="addItem"
          />
        </div>

        <div class="items-table-container">
          <table class="w-full items-table">
            <thead>
              <tr>
                <th>{{ t('receptions.table.material') }}</th>
                <th style="width: 130px;">{{ t('receptions.table.sent') }}</th>
                <th style="width: 130px;">{{ t('receptions.table.received') }}</th>
                <th style="width: 90px;">{{ t('receptions.table.unit') }}</th>
                <th style="width: 100px;">{{ t('receptions.table.diff') }}</th>
                <th style="width: 48px;"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in form.items" :key="item.id">
                <td>
                  <pv-input-text v-model="item.materialName" class="w-full" placeholder="Nombre material" />
                </td>
                <td>
                  <pv-input-number v-model="item.dispatchedQuantity" :min="0" :maxFractionDigits="3" class="w-full" />
                </td>
                <td>
                  <pv-input-number v-model="item.receivedQuantity" :min="0" :maxFractionDigits="3" class="w-full" />
                </td>
                <td>
                  <pv-input-text v-model="item.unit" class="w-full" placeholder="t, m³, kg" />
                </td>
                <td class="text-center font-bold">
                  <span :class="(item.dispatchedQuantity - item.receivedQuantity) > 0 ? 'text-red-500' : 'text-green-600'">
                    {{ (item.dispatchedQuantity - item.receivedQuantity).toFixed(1) }}
                  </span>
                </td>
                <td class="text-center">
                  <pv-button
                    icon="pi pi-trash"
                    class="p-button-text p-button-danger p-button-sm"
                    @click="removeItem(idx)"
                    :disabled="form.items.length <= 1"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Checklist de Verificación en Obra -->
      <div class="checklist-section mb-4">
        <label class="section-label mb-2">
          <i class="pi pi-check-square mr-1 text-primary"></i>
          {{ t('receptions.checklist.title') }}
        </label>
        <div class="grid grid-nogutter checklist-grid">
          <div class="col-12 sm:col-6 mb-2 flex align-items-center">
            <pv-checkbox v-model="form.checklist.materialGoodCondition" :binary="true" inputId="chk-good" />
            <label for="chk-good" class="ml-2 cursor-pointer">{{ t('receptions.checklist.goodCondition') }}</label>
          </div>
          <div class="col-12 sm:col-6 mb-2 flex align-items-center">
            <pv-checkbox v-model="form.checklist.quantityVerified" :binary="true" inputId="chk-qty" />
            <label for="chk-qty" class="ml-2 cursor-pointer">{{ t('receptions.checklist.verifiedQuantity') }}</label>
          </div>
          <div class="col-12 sm:col-6 mb-2 flex align-items-center">
            <pv-checkbox v-model="form.checklist.deliveryGuideReceived" :binary="true" inputId="chk-guide" />
            <label for="chk-guide" class="ml-2 cursor-pointer">{{ t('receptions.checklist.guideReceived') }}</label>
          </div>
          <div class="col-12 sm:col-6 mb-2 flex align-items-center">
            <pv-checkbox v-model="form.checklist.observationsRecorded" :binary="true" inputId="chk-obs" />
            <label for="chk-obs" class="ml-2 cursor-pointer">{{ t('receptions.checklist.observationsRecorded') }}</label>
          </div>
        </div>
      </div>

      <!-- Observaciones -->
      <div class="mb-3">
        <label class="field-label">{{ t('receptions.dialog.observations') }}</label>
        <pv-textarea
          v-model="form.observations"
          rows="2"
          class="w-full"
          :placeholder="t('receptions.dialog.observationsPlaceholder')"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-content-end gap-2">
        <pv-button
          :label="t('common.cancel')"
          class="btn-secondary"
          @click="closeDialog"
          :disabled="isSubmitting"
        />
        <pv-button
          :label="t('receptions.dialog.saveAction')"
          icon="pi pi-check"
          class="btn-accent"
          @click="onSubmit"
          :loading="isSubmitting"
        />
      </div>
    </template>
  </pv-dialog>
</template>

<style scoped>
.register-dialog-content {
  max-height: 75vh;
  overflow-y: auto;
  padding-right: var(--sp-4);
}

.error-banner {
  background-color: #FDE8E8;
  color: var(--color-error);
  padding: var(--sp-8) var(--sp-16);
  border-radius: var(--radius-actionable);
  display: flex;
  align-items: center;
  font-size: 13px;
}

.section-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: var(--sp-8);
}

.field-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: var(--sp-4);
}

.items-table {
  border-collapse: collapse;
  font-size: 13px;
}

.items-table th {
  background-color: #F3F4F6;
  padding: 8px;
  text-align: left;
  font-weight: 600;
  color: var(--color-text-secondary);
  border-bottom: 1px solid #E5E7EB;
}

.items-table td {
  padding: 6px 8px;
  border-bottom: 1px solid #F3F4F6;
}

.checklist-grid {
  background-color: #F9FAFB;
  padding: var(--sp-12, 12px);
  border-radius: var(--radius-actionable);
  border: 1px solid #E5E7EB;
}

.checklist-grid label {
  font-size: 13px;
  color: var(--color-text-main);
}
</style>
