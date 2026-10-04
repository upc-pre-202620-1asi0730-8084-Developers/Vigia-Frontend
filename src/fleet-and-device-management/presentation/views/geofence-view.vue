<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LMap, LTileLayer, LMarker, LCircle, LPopup } from '@vue-leaflet/vue-leaflet';
import { useFleetStore } from '../../application/fleet.store.js';
import { GeofenceType } from '../../domain/geofence-type.js';
import useIamStore from '../../../iam/application/iam.store.js';

// Configurar íconos de Leaflet para evitar problemas de rutas relativas con empaquetadores
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const { t } = useI18n();
const toast = useToast();
const fleetStore = useFleetStore();
const iamStore = useIamStore();

// Centro por defecto: Lima, Perú (§3.5)
const mapZoom = ref(12);
const mapCenter = ref([-12.0464, -77.0428]);
const selectedCenter = ref(null);
const isSubmitting = ref(false);

// Predios de prueba disponibles en el sistema según tipo (§4.6.1)
const availableSites = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Almacén Central Lurín', type: GeofenceType.WAREHOUSE },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Almacén Callao - Base Logística', type: GeofenceType.WAREHOUSE },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Obra Torres de San Isidro', type: GeofenceType.JOB_SITE },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Obra Condominio Las Palmas - Surco', type: GeofenceType.JOB_SITE },
  { id: '55555555-5555-5555-5555-555555555555', name: 'Obra Puente Vía Expresa Sur', type: GeofenceType.JOB_SITE }
];

const geofenceTypeOptions = [
  { label: 'Almacén', value: GeofenceType.WAREHOUSE },
  { label: 'Obra', value: GeofenceType.JOB_SITE }
];

const form = reactive({
  type: GeofenceType.WAREHOUSE,
  siteId: '',
  name: '',
  radiusMeters: 200
});

const formErrors = reactive({
  siteId: '',
  name: '',
  radius: '',
  center: '',
  general: ''
});

onMounted(() => {
  fleetStore.fetchGeofences().catch(err => {
    console.error('Error al inicializar geocercas:', err);
  });
});

const existingGeofences = computed(() => fleetStore.geofences);

// Filtrar predios según el tipo seleccionado
const filteredSites = computed(() => {
  return availableSites.filter(site => site.type === form.type);
});

// Validación reactiva del formulario
const isFormValid = computed(() => {
  return (
    form.type &&
    form.siteId &&
    form.name.trim().length > 0 &&
    selectedCenter.value !== null &&
    form.radiusMeters >= 10 &&
    form.radiusMeters <= 5000
  );
});

// Manejador de clic en el mapa para fijar el centro (§3.5)
const onMapClick = (event) => {
  if (event && event.latlng) {
    selectedCenter.value = {
      latitude: Number(event.latlng.lat.toFixed(6)),
      longitude: Number(event.latlng.lng.toFixed(6))
    };
    formErrors.center = '';
  }
};

// Autocompletar nombre al seleccionar predio si está vacío
const onSiteChange = (event) => {
  formErrors.siteId = '';
  const selected = availableSites.find(s => s.id === event.value);
  if (selected && !form.name) {
    form.name = `Geocerca ${selected.name}`;
  }
};

// Enviar formulario para definir la geocerca
const handleSubmit = async () => {
  formErrors.siteId = '';
  formErrors.name = '';
  formErrors.radius = '';
  formErrors.center = '';
  formErrors.general = '';

  if (!form.siteId) {
    formErrors.siteId = t('fleet.errors.siteRequired');
    return;
  }
  if (!form.name.trim()) {
    formErrors.name = t('fleet.errors.nameRequired');
    return;
  }
  if (!selectedCenter.value) {
    formErrors.center = t('fleet.errors.centerRequired');
    return;
  }
  if (form.radiusMeters < 10 || form.radiusMeters > 5000) {
    formErrors.radius = t('fleet.errors.radiusInvalid');
    return;
  }

  isSubmitting.value = true;
  try {
    const created = await fleetStore.defineGeofence({
      companyId: iamStore.companyId,
      siteId: form.siteId,
      name: form.name.trim(),
      type: form.type,
      centerPoint: selectedCenter.value,
      radiusMeters: form.radiusMeters
    });

    // Toast de éxito específico según el tipo (§3.3)
    const successToast = form.type === GeofenceType.WAREHOUSE
      ? t('fleet.geofences.definedWarehouseToast')
      : t('fleet.geofences.definedJobSiteToast');

    toast.add({
      severity: 'success',
      summary: successToast,
      detail: `${created.name} (${created.radiusMeters} m)`,
      life: 3500
    });

    // Resetear selección
    form.siteId = '';
    form.name = '';
    selectedCenter.value = null;
  } catch (error) {
    if (error.code === 'SITE_ALREADY_HAS_GEOFENCE' || error.status === 409) {
      formErrors.siteId = t('fleet.errors.siteAlreadyHasGeofence');
    } else if (error.status === 0) {
      formErrors.general = t('fleet.errors.networkError');
    } else {
      formErrors.general = error.message || t('fleet.errors.networkError');
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="geofence-view-layout">
    <!-- Panel del formulario (izq en desktop, debajo en mobile) -->
    <div class="form-container">
      <pv-card>
        <template #title>
          <div class="flex align-items-center gap-2">
            <i class="pi pi-compass text-primary" aria-hidden="true"></i>
            <h3>{{ t('fleet.geofences.new') }}</h3>
          </div>
        </template>
        <template #content>
          <form @submit.prevent="handleSubmit" class="geofence-form">
            <!-- Tipo de Predio (Almacén / Obra) -->
            <div class="form-field mb-3">
              <label for="type-select" class="field-label font-bold mb-1 block">
                {{ t('fleet.geofences.typeLabel') }} *
              </label>
              <pv-select
                id="type-select"
                v-model="form.type"
                :options="geofenceTypeOptions"
                option-label="label"
                option-value="value"
                class="w-full"
                @change="form.siteId = ''"
              />
            </div>

            <!-- Selector de Predio -->
            <div class="form-field mb-3">
              <label for="site-select" class="field-label font-bold mb-1 block">
                {{ t('fleet.geofences.siteLabel') }} *
              </label>
              <pv-select
                id="site-select"
                v-model="form.siteId"
                :options="filteredSites"
                option-label="name"
                option-value="id"
                placeholder="Selecciona un predio"
                class="w-full"
                :class="{ 'input-error': formErrors.siteId }"
                @change="onSiteChange"
              />
              <div v-if="formErrors.siteId" class="error-message">{{ formErrors.siteId }}</div>
            </div>

            <!-- Nombre de la Geocerca -->
            <div class="form-field mb-3">
              <label for="name-input" class="field-label font-bold mb-1 block">
                {{ t('fleet.geofences.nameLabel') }} *
              </label>
              <pv-input-text
                id="name-input"
                v-model="form.name"
                :placeholder="t('fleet.geofences.namePlaceholder')"
                class="w-full"
                :class="{ 'input-error': formErrors.name }"
              />
              <div v-if="formErrors.name" class="error-message">{{ formErrors.name }}</div>
            </div>

            <!-- Radio en Metros (10 a 5000 m) -->
            <div class="form-field mb-3">
              <label for="radius-input" class="field-label font-bold mb-1 block">
                {{ t('fleet.geofences.radiusLabel') }} *
              </label>
              <pv-input-number
                id="radius-input"
                v-model="form.radiusMeters"
                :min="10"
                :max="5000"
                :step="25"
                suffix=" m"
                class="w-full"
                :class="{ 'input-error': formErrors.radius }"
              />
              <small class="text-color-secondary block mt-1">Rango sugerido: 10 m – 5000 m</small>
              <div v-if="formErrors.radius" class="error-message">{{ formErrors.radius }}</div>
            </div>

            <!-- Estado de Centro Fijado -->
            <div class="center-status-box p-3 mb-3 border-round">
              <div v-if="selectedCenter" class="center-selected">
                <i class="pi pi-check-circle text-primary mr-2" aria-hidden="true"></i>
                <span>{{ t('fleet.geofences.centerSelected', { lat: selectedCenter.latitude, lng: selectedCenter.longitude }) }}</span>
              </div>
              <div v-else class="center-pending">
                <i class="pi pi-info-circle text-color-secondary mr-2" aria-hidden="true"></i>
                <span>{{ t('fleet.geofences.centerNotSelected') }}</span>
              </div>
              <div v-if="formErrors.center" class="error-message mt-2">{{ formErrors.center }}</div>
            </div>

            <div v-if="formErrors.general" class="error-message mb-3">{{ formErrors.general }}</div>

            <!-- Botón de acción: Ámbar, deshabilitado hasta que haya datos válidos (§3.2, §3.5) -->
            <div class="form-actions mt-4">
              <pv-button
                type="submit"
                :label="t('fleet.geofences.submit')"
                icon="pi pi-check"
                class="btn-accent w-full"
                :disabled="!isFormValid || isSubmitting"
                :loading="isSubmitting"
              />
            </div>
          </form>
        </template>
      </pv-card>

      <!-- Lista de geocercas existentes -->
      <div class="existing-geofences-card mt-3">
        <pv-card>
          <template #title>
            <h3>{{ t('fleet.geofences.existingGeofences') }} ({{ existingGeofences.length }})</h3>
          </template>
          <template #content>
            <ul class="geofence-list">
              <li
                v-for="gf in existingGeofences"
                :key="gf.id"
                class="geofence-list-item flex justify-content-between align-items-center py-2 border-bottom-1 surface-border"
              >
                <div>
                  <strong>{{ gf.name }}</strong>
                  <div class="text-xs text-color-secondary">
                    Radio: {{ gf.radiusMeters }} m
                  </div>
                </div>
                <pv-tag
                  :value="gf.type === GeofenceType.WAREHOUSE ? 'Almacén' : 'Obra'"
                  :class="gf.type === GeofenceType.WAREHOUSE ? 'tag-warehouse' : 'tag-jobsite'"
                />
              </li>
            </ul>
          </template>
        </pv-card>
      </div>
    </div>

    <!-- Contenedor del Mapa Leaflet (§3.5) -->
    <div class="map-container">
      <div class="map-wrapper">
        <l-map
          ref="map"
          v-model:zoom="mapZoom"
          :center="mapCenter"
          :use-global-leaflet="false"
          class="vigia-leaflet-map"
          @click="onMapClick"
        >
          <l-tile-layer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            layer-type="base"
            name="OpenStreetMap"
            attribution="&copy; OpenStreetMap contributors"
          />

          <!-- Geocercas existentes en Azul (Almacén) y Ámbar (Obra), nunca verde ni rojo (§3.5) -->
          <l-circle
            v-for="gf in existingGeofences"
            :key="gf.id"
            :lat-lng="[gf.centerPoint.latitude, gf.centerPoint.longitude]"
            :radius="gf.radiusMeters"
            :color="gf.type === GeofenceType.WAREHOUSE ? '#1B3A5C' : '#F5A623'"
            :fill-color="gf.type === GeofenceType.WAREHOUSE ? '#1B3A5C' : '#F5A623'"
            :fill-opacity="0.25"
            :weight="2"
          >
            <l-popup>
              <div class="popup-content">
                <strong>{{ gf.name }}</strong><br />
                <span>{{ gf.type === GeofenceType.WAREHOUSE ? 'Almacén' : 'Obra' }}</span><br />
                <span>Radio: {{ gf.radiusMeters }} metros</span>
              </div>
            </l-popup>
          </l-circle>

          <!-- Previsualización en vivo del círculo seleccionado (§3.5) -->
          <l-circle
            v-if="selectedCenter"
            :lat-lng="[selectedCenter.latitude, selectedCenter.longitude]"
            :radius="form.radiusMeters || 100"
            color="#3D6B94"
            fill-color="#3D6B94"
            :fill-opacity="0.35"
            :weight="2"
            dash-array="6, 6"
          />

          <!-- Marcador en el centro seleccionado -->
          <l-marker
            v-if="selectedCenter"
            :lat-lng="[selectedCenter.latitude, selectedCenter.longitude]"
          />
        </l-map>

        <!-- Leyenda del mapa (§3.5) -->
        <div class="map-legend">
          <div class="legend-item">
            <span class="legend-color legend-blue"></span>
            <span>Almacenes (Azul)</span>
          </div>
          <div class="legend-item">
            <span class="legend-color legend-amber"></span>
            <span>Obras (Ámbar)</span>
          </div>
          <div class="legend-item">
            <span class="legend-color legend-preview"></span>
            <span>Vista previa</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.geofence-view-layout {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: var(--sp-24);
  align-items: start;
}

.center-status-box {
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  font-size: 13px;
}

.center-selected {
  color: var(--color-primary);
  font-weight: 500;
}

.center-pending {
  color: var(--color-text-secondary);
}

.map-container {
  width: 100%;
  position: relative;
}

.map-wrapper {
  position: relative;
  border-radius: var(--radius-actionable);
  overflow: hidden;
  box-shadow: var(--elevation-1);
  height: 600px;
}

.vigia-leaflet-map {
  height: 100%;
  width: 100%;
  min-height: 400px;
  cursor: crosshair;
}

.map-legend {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 12px;
  border-radius: var(--radius-actionable);
  box-shadow: var(--elevation-1);
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  z-index: 999;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
}

.legend-blue {
  background-color: #1B3A5C;
}

.legend-amber {
  background-color: #F5A623;
}

.legend-preview {
  background-color: #3D6B94;
  border: 1px dashed #FFFFFF;
}

.tag-warehouse {
  background-color: rgba(27, 58, 92, 0.12) !important;
  color: #1B3A5C !important;
  border: 1px solid #1B3A5C !important;
  font-size: 11px;
}

.tag-jobsite {
  background-color: rgba(245, 166, 35, 0.15) !important;
  color: #925400 !important;
  border: 1px solid #F5A623 !important;
  font-size: 11px;
}

.geofence-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
}

/* En Mobile (<960px): Mapa ocupa ancho completo (~50vh) y formulario debajo (§3.5) */
@media (max-width: 960px) {
  .geofence-view-layout {
    grid-template-columns: 1fr;
    display: flex;
    flex-direction: column;
  }

  .map-container {
    order: 1; /* Mapa primero arriba en mobile */
  }

  .map-wrapper {
    height: 50vh;
    min-height: 320px;
  }

  .form-container {
    order: 2; /* Formulario debajo */
    width: 100%;
  }
}
</style>
