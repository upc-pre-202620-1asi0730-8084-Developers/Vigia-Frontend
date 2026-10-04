<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import VehicleListView from './vehicle-list-view.vue';
import GeofenceView from './geofence-view.vue';

const { t } = useI18n();
const activeTab = ref('vehicles');
</script>

<template>
  <div class="transport-view">
    <div class="header-section mb-4">
      <h1>{{ t('fleet.title') }}</h1>
      <p class="subtitle">{{ t('fleet.subtitle') }}</p>
    </div>

    <!-- Pestañas de navegación local: Unidades y Geocercas (§3.5) -->
    <div class="tabs-container mb-4">
      <pv-button
        :label="t('fleet.tabs.vehicles')"
        icon="pi pi-truck"
        :class="activeTab === 'vehicles' ? 'btn-primary' : 'btn-secondary'"
        @click="activeTab = 'vehicles'"
      />
      <pv-button
        :label="t('fleet.tabs.geofences')"
        icon="pi pi-map"
        :class="activeTab === 'geofences' ? 'btn-primary' : 'btn-secondary'"
        @click="activeTab = 'geofences'"
      />
    </div>

    <!-- Pestaña 1: Unidades de Transporte (US-18) -->
    <div v-show="activeTab === 'vehicles'" class="tab-content">
      <VehicleListView />
    </div>

    <!-- Pestaña 2: Geocercas de Predios (US-19) -->
    <div v-show="activeTab === 'geofences'" class="tab-content">
      <GeofenceView />
    </div>
  </div>
</template>

<style scoped>
.transport-view {
  width: 100%;
}

.subtitle {
  color: var(--color-text-secondary);
  margin-top: -8px;
}

.tabs-container {
  display: flex;
  gap: var(--sp-8);
}
</style>
