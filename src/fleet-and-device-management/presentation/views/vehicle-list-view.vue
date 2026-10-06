<script setup>
import { onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useFleetStore } from '../../application/fleet.store.js';

const { t } = useI18n();
const router = useRouter();
const fleetStore = useFleetStore();

onMounted(() => {
  fleetStore.fetchVehicles().catch(err => {
    console.error('Error al inicializar vehículos:', err);
  });
});

const vehicles = computed(() => fleetStore.vehicles);

// Registrar unidad y vincular GPS se hacen en páginas propias (no en ventanas emergentes)
const goToRegister = () => router.push({ name: 'vehicle-new' });

/** @param {import('../../domain/vehicle.entity.js').Vehicle} vehicle */
const goToPair = (vehicle) => router.push({ name: 'vehicle-pair-device', params: { id: vehicle.id } });
</script>

<template>
  <div class="vehicles-view">
    <div class="actions-bar mb-4">
      <!-- Botón de acción principal: Ámbar (#F5A623), texto #212121, hover #3D6B94 (§3.2, §3.5) -->
      <pv-button
        :label="t('fleet.vehicles.new')"
        icon="pi pi-plus"
        class="btn-accent"
        @click="goToRegister"
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
              @click="goToPair(data)"
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
                @click="goToPair(vehicle)"
              />
            </div>
          </template>
        </pv-card>
      </div>
    </div>
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
