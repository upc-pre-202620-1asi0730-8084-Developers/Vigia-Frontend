<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue';
import { useFleetStore } from '../../application/fleet.store.js';

/**
 * Page to pair a GPS device with a registered transport unit (US-18).
 * Route: /transporte/unidades/:id/gps
 */
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const fleetStore = useFleetStore();

const isPairing = ref(false);
const deviceId = ref('');
const pairErrors = ref({ deviceId: '', general: '' });

const targetVehicle = computed(() => fleetStore.vehicles.find(v => String(v.id) === String(route.params.id)) ?? null);

onMounted(() => {
  if (!fleetStore.vehicles.length) {
    fleetStore.fetchVehicles().catch(error => { pairErrors.value.general = error.message; });
  }
});

// Precarga el dispositivo actual cuando la unidad está disponible
watch(targetVehicle, vehicle => { if (vehicle && !deviceId.value) deviceId.value = vehicle.gpsDeviceId || ''; }, { immediate: true });

const goBack = () => router.push('/transporte');

// Vincular dispositivo GPS
const handlePair = async () => {
  pairErrors.value = { deviceId: '', general: '' };
  const trimmed = deviceId.value.trim();

  if (!trimmed) {
    pairErrors.value.deviceId = t('fleet.errors.deviceRequired');
    return;
  }

  isPairing.value = true;
  try {
    await fleetStore.pairDevice(targetVehicle.value.id, trimmed);
    toast.add({
      severity: 'success',
      summary: t('fleet.vehicles.pairedToast'),
      detail: `${trimmed} → ${targetVehicle.value.licensePlate}`,
      life: 3000
    });
    goBack();
  } catch (error) {
    if (error.code === 'DEVICE_ALREADY_ASSIGNED' || error.status === 409) {
      pairErrors.value.deviceId = t('fleet.errors.deviceAlreadyAssigned', {
        deviceId: trimmed,
        plate: error.assignedLicensePlate || 'otra unidad'
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
  <div class="p-4">
    <div class="page-header">
      <pv-button :label="t('fleet.title')" icon="pi pi-arrow-left" link class="back-link" @click="goBack" />
      <h1 class="m-0">{{ t('fleet.vehicles.dialog.pairTitle') }}</h1>
    </div>

    <form class="vigia-card page-form" novalidate @submit.prevent="handlePair">
      <div v-if="targetVehicle" class="vehicle-summary mb-3">
        <i class="pi pi-truck" aria-hidden="true" />
        <div>
          <strong>{{ t('fleet.vehicles.plate') }}: {{ targetVehicle.licensePlate }}</strong>
          <div class="subtitle">{{ targetVehicle.brand }} {{ targetVehicle.model }}</div>
        </div>
      </div>

      <div class="form-field">
        <label for="pair-gps-input" class="field-label">{{ t('fleet.vehicles.dialog.gpsDeviceLabel') }} *</label>
        <pv-input-text
            id="pair-gps-input"
            v-model="deviceId"
            placeholder="Ej. GPS-TR-105"
            :invalid="!!pairErrors.deviceId"
            :disabled="!targetVehicle"
        />
        <!-- 409 se muestra en línea con borde rojo (§3.5) -->
        <div v-if="pairErrors.deviceId" class="error-message">{{ pairErrors.deviceId }}</div>
      </div>

      <div v-if="pairErrors.general" class="error-message mt-3">{{ pairErrors.general }}</div>

      <div class="form-footer">
        <pv-button type="button" :label="t('fleet.vehicles.dialog.cancel')" class="btn-secondary" @click="goBack" />
        <pv-button
            type="submit"
            :label="t('fleet.vehicles.dialog.submitPair')"
            icon="pi pi-link"
            class="btn-accent"
            :loading="isPairing"
            :disabled="isPairing || !targetVehicle"
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
  max-width: 32rem;
}

.subtitle {
  color: var(--color-text-secondary);
}

.vehicle-summary {
  display: flex;
  align-items: center;
  gap: var(--sp-16);
  padding: var(--sp-16);
  border-radius: var(--radius-actionable);
  background-color: var(--color-bg);
}

.vehicle-summary .pi {
  font-size: 1.25rem;
  color: var(--color-primary);
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
