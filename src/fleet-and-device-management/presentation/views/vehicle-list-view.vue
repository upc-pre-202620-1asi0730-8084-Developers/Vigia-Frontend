<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue';
import { useFleetStore } from '../../application/fleet.store.js';
import { Vehicle } from '../../domain/vehicle.entity.js';
import useIamStore from '../../../iam/application/iam.store.js';

const { t } = useI18n();
const toast = useToast();
const fleetStore = useFleetStore();
const iamStore = useIamStore();

// Estados de diálogos
const registerDialogVisible = ref(false);
const pairDialogVisible = ref(false);
const isSubmitting = ref(false);
const isPairing = ref(false);

// Formulario de registro
const form = ref({
  plate: '',
  brand: '',
  model: '',
  capacity: null,
  gpsDeviceId: ''
});

const formErrors = ref({
  plate: '',
  capacity: '',
  gpsDevice: '',
  general: ''
});

// Formulario de vinculación rápida por fila
const targetVehicle = ref(null);
const pairForm = ref({
  deviceId: ''
});
const pairErrors = ref({
  deviceId: '',
  general: ''
});

onMounted(() => {
  fleetStore.fetchVehicles().catch(err => {
    console.error('Error al inicializar vehículos:', err);
  });
});

const vehicles = computed(() => fleetStore.vehicles);

// Abrir diálogo de registro
const openRegisterDialog = () => {
  form.value = {
    plate: '',
    brand: '',
    model: '',
    capacity: null,
    gpsDeviceId: ''
  };
  formErrors.value = { plate: '', capacity: '', gpsDevice: '', general: '' };
  registerDialogVisible.value = true;
};

// Cerrar diálogo de registro
const closeRegisterDialog = () => {
  registerDialogVisible.value = false;
};

// Validar y registrar unidad
const handleRegister = async () => {
  formErrors.value = { plate: '', capacity: '', gpsDevice: '', general: '' };

  const normalizedPlate = Vehicle.normalizeLicensePlate(form.value.plate);
  if (!normalizedPlate) {
    formErrors.value.plate = t('fleet.errors.plateRequired');
    return;
  }

  const capacityVal = Number(form.value.capacity);
  if (isNaN(capacityVal) || capacityVal <= 0) {
    formErrors.value.capacity = t('fleet.errors.capacityInvalid');
    return;
  }

  isSubmitting.value = true;
  try {
    const { vehicle, pairingError } = await fleetStore.registerVehicle({
      companyId: iamStore.companyId,
      licensePlate: normalizedPlate,
      brand: form.value.brand.trim(),
      model: form.value.model.trim(),
      maxCapacityTons: capacityVal
    }, form.value.gpsDeviceId);

    // Toast de éxito por registro (§3.3)
    toast.add({
      severity: 'success',
      summary: t('fleet.vehicles.registeredToast'),
      detail: `${vehicle.licensePlate} (${vehicle.brand} ${vehicle.model})`,
      life: 3000
    });

    if (pairingError) {
      // Hubo error en la vinculación opcional (ej. 409 ya asignado)
      if (pairingError.code === 'DEVICE_ALREADY_ASSIGNED') {
        const otherPlate = pairingError.assignedLicensePlate || 'otra unidad';
        toast.add({
          severity: 'error',
          summary: t('fleet.vehicles.dialog.pairTitle'),
          detail: t('fleet.errors.deviceAlreadyAssigned', {
            deviceId: form.value.gpsDeviceId,
            plate: otherPlate
          }),
          life: 6000
        });
      } else {
        toast.add({
          severity: 'error',
          summary: t('fleet.vehicles.dialog.pairTitle'),
          detail: pairingError.message,
          life: 4000
        });
      }
    } else if (form.value.gpsDeviceId && form.value.gpsDeviceId.trim()) {
      toast.add({
        severity: 'success',
        summary: t('fleet.vehicles.pairedToast'),
        detail: form.value.gpsDeviceId,
        life: 3000
      });
    }

    registerDialogVisible.value = false;
  } catch (error) {
    if (error.code === 'PLATE_ALREADY_REGISTERED' || error.status === 409) {
      formErrors.value.plate = t('fleet.errors.plateDuplicate', { plate: normalizedPlate });
    } else if (error.status === 0) {
      formErrors.value.general = t('fleet.errors.networkError');
    } else {
      formErrors.value.general = error.message || t('fleet.errors.networkError');
    }
  } finally {
    isSubmitting.value = false;
  }
};

// Abrir diálogo de vinculación individual por fila
const openPairDialog = (vehicle) => {
  targetVehicle.value = vehicle;
  pairForm.value.deviceId = vehicle.gpsDeviceId || '';
  pairErrors.value = { deviceId: '', general: '' };
  pairDialogVisible.value = true;
};

const closePairDialog = () => {
  pairDialogVisible.value = false;
  targetVehicle.value = null;
};

// Vincular dispositivo GPS
const handlePair = async () => {
  pairErrors.value = { deviceId: '', general: '' };
  const deviceId = pairForm.value.deviceId.trim();

  if (!deviceId) {
    pairErrors.value.deviceId = t('fleet.errors.deviceRequired');
    return;
  }

  isPairing.value = true;
  try {
    await fleetStore.pairDevice(targetVehicle.value.id, deviceId);
    toast.add({
      severity: 'success',
      summary: t('fleet.vehicles.pairedToast'),
      detail: `${deviceId} → ${targetVehicle.value.licensePlate}`,
      life: 3000
    });
    pairDialogVisible.value = false;
  } catch (error) {
    if (error.code === 'DEVICE_ALREADY_ASSIGNED' || error.status === 409) {
      const otherPlate = error.assignedLicensePlate || 'otra unidad';
      pairErrors.value.deviceId = t('fleet.errors.deviceAlreadyAssigned', {
        deviceId,
        plate: otherPlate
      });
    } else if (error.status === 0) {
      pairErrors.value.general = t('fleet.errors.networkError');
    } else {
      pairErrors.value.general = error.message;
    }
  } finally {
    isPairing.value = false;
  }
};
</script>

<template>
  <div class="vehicles-view">
    <div class="actions-bar mb-4">
      <!-- Botón de acción principal: Ámbar (#F5A623), texto #212121, hover #3D6B94 (§3.2, §3.5) -->
      <pv-button
        :label="t('fleet.vehicles.new')"
        icon="pi pi-plus"
        class="btn-accent"
        @click="openRegisterDialog"
      />
    </div>

    <!-- Estado vacío -->
    <div v-if="!fleetStore.loadingVehicles && vehicles.length === 0" class="empty-state">
      <pv-card>
        <template #content>
          <div class="text-center p-4">
            <i class="pi pi-truck empty-icon mb-3" aria-hidden="true"></i>
            <p class="m-0 text-color-secondary">{{ t('fleet.vehicles.empty') }}</p>
          </div>
        </template>
      </pv-card>
    </div>

    <!-- Tabla Desktop (>768px, §3.5) -->
    <div v-else class="desktop-table-container">
      <pv-data-table
        :value="vehicles"
        :loading="fleetStore.loadingVehicles"
        striped-rows
        responsive-layout="scroll"
        class="p-datatable-sm"
      >
        <pv-column field="licensePlate" :header="t('fleet.vehicles.plate')" sortable>
          <template #body="{ data }">
            <strong>{{ data.licensePlate }}</strong>
          </template>
        </pv-column>
        <pv-column field="brand" :header="t('fleet.vehicles.brand')" sortable />
        <pv-column field="model" :header="t('fleet.vehicles.model')" sortable />
        <pv-column field="maxCapacityTons" :header="t('fleet.vehicles.capacity')" sortable>
          <template #body="{ data }">
            {{ data.maxCapacityTons }} t
          </template>
        </pv-column>
        <pv-column :header="t('fleet.vehicles.gpsDevice')">
          <template #body="{ data }">
            <!-- Tag: Azul "Vinculado", Ámbar "Sin dispositivo" (§3.5) -->
            <pv-tag
              v-if="data.isGpsPaired"
              :value="t('fleet.vehicles.pairedTag')"
              class="tag-paired"
            />
            <pv-tag
              v-else
              :value="t('fleet.vehicles.unpairedTag')"
              class="tag-unpaired"
            />
            <span v-if="data.isGpsPaired" class="ml-2 device-id-text">
              ({{ data.gpsDeviceId }})
            </span>
          </template>
        </pv-column>
        <pv-column :header="t('fleet.vehicles.actions')" style="width: 180px">
          <template #body="{ data }">
            <pv-button
              :label="t('fleet.vehicles.pairAction')"
              icon="pi pi-link"
              class="p-button-text p-button-sm btn-action-pair"
              @click="openPairDialog(data)"
            />
          </template>
        </pv-column>
      </pv-data-table>
    </div>

    <!-- Tarjetas Mobile (<768px, §3.5) -->
    <div class="mobile-cards-container">
      <div v-for="vehicle in vehicles" :key="vehicle.id" class="vehicle-card-wrapper mb-3">
        <pv-card>
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <span>{{ vehicle.licensePlate }}</span>
              <pv-tag
                :value="vehicle.isGpsPaired ? t('fleet.vehicles.pairedTag') : t('fleet.vehicles.unpairedTag')"
                :class="vehicle.isGpsPaired ? 'tag-paired' : 'tag-unpaired'"
              />
            </div>
          </template>
          <template #content>
            <div class="card-details">
              <p><strong>{{ t('fleet.vehicles.brand') }}:</strong> {{ vehicle.brand }}</p>
              <p><strong>{{ t('fleet.vehicles.model') }}:</strong> {{ vehicle.model }}</p>
              <p><strong>{{ t('fleet.vehicles.capacity') }}:</strong> {{ vehicle.maxCapacityTons }} t</p>
              <p v-if="vehicle.isGpsPaired">
                <strong>{{ t('fleet.vehicles.gpsDevice') }}:</strong> {{ vehicle.gpsDeviceId }}
              </p>
            </div>
            <div class="mt-3">
              <pv-button
                :label="t('fleet.vehicles.pairAction')"
                icon="pi pi-link"
                class="p-button-outlined w-full btn-action-pair"
                @click="openPairDialog(vehicle)"
              />
            </div>
          </template>
        </pv-card>
      </div>
    </div>

    <!-- Dialog: Registrar unidad (§3.5) -->
    <pv-dialog
      v-model:visible="registerDialogVisible"
      :header="t('fleet.vehicles.dialog.registerTitle')"
      :modal="true"
      :style="{ width: '100%', maxWidth: '520px' }"
    >
      <form @submit.prevent="handleRegister" class="dialog-form">
        <!-- Placa -->
        <div class="form-field mb-3">
          <label for="plate-input" class="field-label font-bold mb-1 block">
            {{ t('fleet.vehicles.dialog.plateLabel') }} *
          </label>
          <pv-input-text
            id="plate-input"
            v-model="form.plate"
            :placeholder="t('fleet.vehicles.dialog.platePlaceholder')"
            class="w-full"
            :class="{ 'input-error': formErrors.plate }"
            @input="form.plate = form.plate.toUpperCase().replace(/\s+/g, '')"
          />
          <div v-if="formErrors.plate" class="error-message">{{ formErrors.plate }}</div>
        </div>

        <!-- Marca -->
        <div class="form-field mb-3">
          <label for="brand-input" class="field-label font-bold mb-1 block">
            {{ t('fleet.vehicles.dialog.brandLabel') }}
          </label>
          <pv-input-text
            id="brand-input"
            v-model="form.brand"
            :placeholder="t('fleet.vehicles.dialog.brandPlaceholder')"
            class="w-full"
          />
        </div>

        <!-- Modelo -->
        <div class="form-field mb-3">
          <label for="model-input" class="field-label font-bold mb-1 block">
            {{ t('fleet.vehicles.dialog.modelLabel') }}
          </label>
          <pv-input-text
            id="model-input"
            v-model="form.model"
            :placeholder="t('fleet.vehicles.dialog.modelPlaceholder')"
            class="w-full"
          />
        </div>

        <!-- Capacidad -->
        <div class="form-field mb-3">
          <label for="capacity-input" class="field-label font-bold mb-1 block">
            {{ t('fleet.vehicles.dialog.capacityLabel') }} *
          </label>
          <pv-input-number
            id="capacity-input"
            v-model="form.capacity"
            :min="0.1"
            :step="0.5"
            mode="decimal"
            :min-fraction-digits="1"
            :max-fraction-digits="2"
            suffix=" t"
            class="w-full"
            :class="{ 'input-error': formErrors.capacity }"
          />
          <div v-if="formErrors.capacity" class="error-message">{{ formErrors.capacity }}</div>
        </div>

        <!-- Dispositivo GPS (opcional) -->
        <div class="form-field mb-3">
          <label for="gps-input" class="field-label font-bold mb-1 block">
            {{ t('fleet.vehicles.dialog.gpsLabel') }}
          </label>
          <pv-input-text
            id="gps-input"
            v-model="form.gpsDeviceId"
            :placeholder="t('fleet.vehicles.dialog.gpsPlaceholder')"
            class="w-full"
            :class="{ 'input-error': formErrors.gpsDevice }"
          />
          <div v-if="formErrors.gpsDevice" class="error-message">{{ formErrors.gpsDevice }}</div>
        </div>

        <div v-if="formErrors.general" class="error-message mb-3">{{ formErrors.general }}</div>

        <div class="dialog-actions flex justify-content-end gap-2 mt-4">
          <pv-button
            type="button"
            :label="t('fleet.vehicles.dialog.cancel')"
            class="btn-secondary"
            @click="closeRegisterDialog"
          />
          <!-- Deshabilitado y loading durante la espera para evitar envíos duplicados (§3.5) -->
          <pv-button
            type="submit"
            :label="t('fleet.vehicles.dialog.submitRegister')"
            icon="pi pi-check"
            class="btn-accent"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          />
        </div>
      </form>
    </pv-dialog>

    <!-- Dialog: Vincular dispositivo (§3.5) -->
    <pv-dialog
      v-model:visible="pairDialogVisible"
      :header="t('fleet.vehicles.dialog.pairTitle')"
      :modal="true"
      :style="{ width: '100%', maxWidth: '440px' }"
    >
      <form @submit.prevent="handlePair" class="dialog-form">
        <div v-if="targetVehicle" class="vehicle-summary p-3 mb-3 bg-blue-50 border-round">
          <p class="m-0">
            <strong>{{ t('fleet.vehicles.plate') }}:</strong> {{ targetVehicle.licensePlate }}
          </p>
          <p class="m-0 text-sm text-color-secondary">
            {{ targetVehicle.brand }} {{ targetVehicle.model }}
          </p>
        </div>

        <div class="form-field mb-3">
          <label for="pair-gps-input" class="field-label font-bold mb-1 block">
            {{ t('fleet.vehicles.dialog.gpsDeviceLabel') }} *
          </label>
          <pv-input-text
            id="pair-gps-input"
            v-model="pairForm.deviceId"
            placeholder="Ej. GPS-TR-105"
            class="w-full"
            :class="{ 'input-error': pairErrors.deviceId }"
            autofocus
          />
          <!-- 409 se muestra en línea con borde rojo (§3.5) -->
          <div v-if="pairErrors.deviceId" class="error-message">{{ pairErrors.deviceId }}</div>
        </div>

        <div v-if="pairErrors.general" class="error-message mb-3">{{ pairErrors.general }}</div>

        <div class="dialog-actions flex justify-content-end gap-2 mt-4">
          <pv-button
            type="button"
            :label="t('fleet.vehicles.dialog.cancel')"
            class="btn-secondary"
            @click="closePairDialog"
          />
          <pv-button
            type="submit"
            :label="t('fleet.vehicles.dialog.submitPair')"
            icon="pi pi-link"
            class="btn-accent"
            :loading="isPairing"
            :disabled="isPairing"
          />
        </div>
      </form>
    </pv-dialog>
  </div>
</template>

<style scoped>
.actions-bar {
  display: flex;
  justify-content: flex-start;
}

.empty-icon {
  font-size: 40px;
  color: var(--color-primary-light);
}

.device-id-text {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.btn-action-pair {
  color: var(--color-primary) !important;
  font-weight: 500;
}

.btn-action-pair:hover {
  background-color: rgba(61, 107, 148, 0.1) !important;
}

/* Responsividad: Mostrar tabla en desktop (>768px), tarjetas en mobile (<=768px) */
@media (min-width: 769px) {
  .desktop-table-container {
    display: block;
  }
  .mobile-cards-container {
    display: none;
  }
}

@media (max-width: 768px) {
  .desktop-table-container {
    display: none;
  }
  .mobile-cards-container {
    display: block;
  }
}

.card-details p {
  margin: 4px 0;
  font-size: 14px;
}
</style>
