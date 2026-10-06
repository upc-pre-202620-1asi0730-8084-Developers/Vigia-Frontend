<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue';
import { useFleetStore } from '../../application/fleet.store.js';
import { Vehicle } from '../../domain/vehicle.entity.js';
import useIamStore from '../../../iam/application/iam.store.js';

/**
 * Page to register a transport unit, optionally pairing its GPS device (US-18).
 */
const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const fleetStore = useFleetStore();
const iamStore = useIamStore();

const isSubmitting = ref(false);
const form = ref({ plate: '', brand: '', model: '', capacity: null, gpsDeviceId: '' });
const formErrors = ref({ plate: '', capacity: '', gpsDevice: '', general: '' });

const goBack = () => router.push('/transporte');

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
      toast.add({
        severity: 'error',
        summary: t('fleet.vehicles.dialog.pairTitle'),
        detail: pairingError.code === 'DEVICE_ALREADY_ASSIGNED'
            ? t('fleet.errors.deviceAlreadyAssigned', { deviceId: form.value.gpsDeviceId, plate: pairingError.assignedLicensePlate || 'otra unidad' })
            : pairingError.message,
        life: 6000
      });
    } else if (form.value.gpsDeviceId && form.value.gpsDeviceId.trim()) {
      toast.add({ severity: 'success', summary: t('fleet.vehicles.pairedToast'), detail: form.value.gpsDeviceId, life: 3000 });
    }

    goBack();
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
</script>

<template>
  <div class="p-4">
    <div class="page-header">
      <pv-button :label="t('fleet.title')" icon="pi pi-arrow-left" link class="back-link" @click="goBack" />
      <h1 class="m-0">{{ t('fleet.vehicles.dialog.registerTitle') }}</h1>
    </div>

    <form class="vigia-card page-form" novalidate @submit.prevent="handleRegister">
      <div class="form-grid">
        <div class="form-field">
          <label for="plate-input" class="field-label">{{ t('fleet.vehicles.dialog.plateLabel') }} *</label>
          <pv-input-text
            id="plate-input"
            v-model="form.plate"
            :placeholder="t('fleet.vehicles.dialog.platePlaceholder')"
            :invalid="!!formErrors.plate"
            @input="form.plate = form.plate.toUpperCase().replace(/\s+/g, '')"
          />
          <div v-if="formErrors.plate" class="error-message">{{ formErrors.plate }}</div>
        </div>

        <div class="form-field">
          <label for="capacity-input" class="field-label">{{ t('fleet.vehicles.dialog.capacityLabel') }} *</label>
          <pv-input-number
            input-id="capacity-input"
            v-model="form.capacity"
            :min="0.1"
            :step="0.5"
            mode="decimal"
            :min-fraction-digits="1"
            :max-fraction-digits="2"
            suffix=" t"
            :invalid="!!formErrors.capacity"
          />
          <div v-if="formErrors.capacity" class="error-message">{{ formErrors.capacity }}</div>
        </div>

        <div class="form-field">
          <label for="brand-input" class="field-label">{{ t('fleet.vehicles.dialog.brandLabel') }}</label>
          <pv-input-text id="brand-input" v-model="form.brand" :placeholder="t('fleet.vehicles.dialog.brandPlaceholder')" />
        </div>

        <div class="form-field">
          <label for="model-input" class="field-label">{{ t('fleet.vehicles.dialog.modelLabel') }}</label>
          <pv-input-text id="model-input" v-model="form.model" :placeholder="t('fleet.vehicles.dialog.modelPlaceholder')" />
        </div>

        <div class="form-field">
          <label for="gps-input" class="field-label">{{ t('fleet.vehicles.dialog.gpsLabel') }}</label>
          <pv-input-text
            id="gps-input"
            v-model="form.gpsDeviceId"
            :placeholder="t('fleet.vehicles.dialog.gpsPlaceholder')"
            :invalid="!!formErrors.gpsDevice"
          />
          <div v-if="formErrors.gpsDevice" class="error-message">{{ formErrors.gpsDevice }}</div>
        </div>
      </div>

      <div v-if="formErrors.general" class="error-message mt-3">{{ formErrors.general }}</div>

      <div class="form-footer">
        <pv-button type="button" :label="t('fleet.vehicles.dialog.cancel')" class="btn-secondary" @click="goBack" />
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
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: var(--sp-16);
}

.back-link {
  padding-left: 0;
}

.page-form {
  max-width: 48rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: var(--sp-16);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.field-label {
  font-weight: 600;
  font-size: 13px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--sp-8);
  margin-top: var(--sp-24);
  padding-top: var(--sp-16);
  border-top: 1px solid var(--p-content-border-color);
}
</style>
