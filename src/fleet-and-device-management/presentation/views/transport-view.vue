<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import VehicleListView from './vehicle-list-view.vue';
import GeofenceView from './geofence-view.vue';
import TransitTrackingView from '../../../transit-traceability/presentation/views/transit-tracking-view.vue';

const { t } = useI18n();
const activeTab = ref('vehicles');
</script>

<template>
  <div class="transport-view">
    <div class="header-section mb-4">
      <h1>{{ t('fleet.title') }}</h1>
      <p class="subtitle">{{ t('fleet.subtitle') }}</p>
    </div>

    <!-- Pestañas de navegación local: Unidades, Geocercas (§3.5) y Seguimiento en tránsito -->
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
      <pv-button
        :label="t('fleet.tabs.tracking')"
        icon="pi pi-map-marker"
        :class="activeTab === 'tracking' ? 'btn-primary' : 'btn-secondary'"
        @click="activeTab = 'tracking'"
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

    <!-- Pestaña 3: Seguimiento en tránsito (BC-06 Transit Traceability); v-if para que Leaflet mida el mapa visible -->
    <div v-if="activeTab === 'tracking'" class="tab-content">
      <TransitTrackingView />
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
