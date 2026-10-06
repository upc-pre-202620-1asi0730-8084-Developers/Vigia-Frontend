<script setup>
import {useI18n} from "vue-i18n";
import {useToast} from "primevue";
import {computed, nextTick, onMounted, ref, toRefs, watch} from "vue";
import 'leaflet/dist/leaflet.css';
import {LCircle, LCircleMarker, LMap, LPolyline, LPopup, LTileLayer} from "@vue-leaflet/vue-leaflet";
import useTransitTraceabilityStore from "../../application/transit-traceability.store.js";
import {SIMULATION_MODE} from "../../infrastructure/telemetry-simulator.js";
import {ROUTE_STATUS, routeStatusSeverity, transitAlertSeverity, TRANSIT_ALERT_TYPE} from "../../domain/route-status.js";

const {t, te, locale} = useI18n();
const toast = useToast();
const store = useTransitTraceabilityStore();
const {routes, routesLoaded, errors, activeCount, deviatedCount, stoppedCount, pendingNotificationsCount} = toRefs(store);
const {fetchRoutes, getRouteById, reportPosition, reportSignalLost, notifyDestinationSite} = store;

const selectedRouteId = ref(null);
const selectedRoute = computed(() => getRouteById(selectedRouteId.value) ?? null);
const tableSelection = computed({
  get: () => selectedRoute.value,
  set: route => { if (route) selectedRouteId.value = route.id; }
});
const isBusy = ref(false);
const map = ref(null);

/** Map colors taken from the global palette tokens (src/style.css). */
const readPalette = () => {
  const css = getComputedStyle(document.documentElement);
  const token = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
  return {
    primary: token('--color-primary', '#1B3A5C'),
    primaryLight: token('--color-primary-light', '#3D6B94'),
    accent: token('--color-accent', '#F5A623'),
    error: token('--color-error', '#D32F2F'),
    surface: token('--color-surface', '#FFFFFF')
  };
};

const palette = readPalette();

onMounted(() => {
  if (!store.routesLoaded) fetchRoutes();
});

/** Select the first active route once routes are available. */
watch(routesLoaded, loaded => {
  if (loaded && !selectedRouteId.value && routes.value.length) {
    selectedRouteId.value = (routes.value.find(r => r.isActive) ?? routes.value[0]).id;
  }
}, {immediate: true});

const toLatLng = point => [point.latitude, point.longitude];
const plannedLatLngs = computed(() => selectedRoute.value?.plannedPath.map(toLatLng) ?? []);
const travelledLatLngs = computed(() => selectedRoute.value?.positions.map(toLatLng) ?? []);
const mapCenter = computed(() => selectedRoute.value?.currentPosition ? toLatLng(selectedRoute.value.currentPosition) : [-12.0464, -77.0428]);

/** Fit the map to the planned path of the selected route. */
const fitToRoute = () => {
  const leafletMap = map.value?.leafletObject;
  if (leafletMap && plannedLatLngs.value.length) leafletMap.fitBounds(plannedLatLngs.value, {padding: [24, 24]});
};
watch(selectedRouteId, () => nextTick(fitToRoute));

const alertsNewestFirst = computed(() => [...(selectedRoute.value?.alerts ?? [])].reverse());
const alertPoints = computed(() => (selectedRoute.value?.alerts ?? []).filter(a =>
    a.latitude !== null && [TRANSIT_ALERT_TYPE.ROUTE_DEVIATION, TRANSIT_ALERT_TYPE.PROLONGED_STOP].includes(a.type)));

/** @param {?string} iso - ISO timestamp. */
const formatDateTime = iso => iso ? new Date(iso).toLocaleString(locale.value, {dateStyle: 'short', timeStyle: 'short'}) : '—';
/** @param {?string} iso - ISO timestamp. */
const formatTime = iso => iso ? new Date(iso).toLocaleTimeString(locale.value, {hour: '2-digit', minute: '2-digit'}) : '—';
const formatKm = meters => `${(meters / 1000).toFixed(1)} km`;

/** @param {import('../../domain/model/transit-alert.entity.js').TransitAlert} alert */
const alertDetail = alert => alert.value !== null && te(`transit.alerts.detail.${alert.type}`)
    ? t(`transit.alerts.detail.${alert.type}`, {value: alert.value})
    : '';

/**
 * Runs a store command for the selected route and reports the outcome with toasts.
 * @param {function(): Promise<*>} command
 * @param {function(*): void} onSuccess
 */
const run = (command, onSuccess) => {
  isBusy.value = true;
  command()
      .then(onSuccess)
      .catch(error => toast.add({severity: 'error', summary: t('transit.toast.error'), detail: error.message, life: 4000}))
      .finally(() => { isBusy.value = false; });
};

/** @param {import('../../domain/model/transit-alert.entity.js').TransitAlert[]} alerts */
const announceAlerts = alerts => {
  if (!alerts.length) {
    toast.add({severity: 'info', summary: t('transit.toast.positionReported'), life: 2000});
    return;
  }
  alerts.forEach(alert => toast.add({
    severity: alert.type === TRANSIT_ALERT_TYPE.GEOFENCE_ENTRY ? 'success' : transitAlertSeverity(alert.type) === 'danger' ? 'error' : 'warn',
    summary: alert.type === TRANSIT_ALERT_TYPE.GEOFENCE_ENTRY ? t('transit.toast.arrived') : t('transit.toast.alertRaised'),
    detail: t(`transit.alerts.type.${alert.type}`),
    life: 4000
  }));
};

/** @param {string} mode - SIMULATION_MODE. */
const simulate = mode => run(() => reportPosition(selectedRoute.value, mode), announceAlerts);
const simulateSignalLost = () => run(() => reportSignalLost(selectedRoute.value), alert => announceAlerts([alert]));
/** @param {string} alertId */
const notifySite = alertId => run(() => notifyDestinationSite(selectedRoute.value, alertId),
    () => toast.add({severity: 'success', summary: t('transit.toast.siteNotified'), detail: selectedRoute.value.destination.name, life: 3000}));
</script>

<template>
  <div class="transit-tracking">
    <div class="grid mb-3">
      <div class="col-12 md:col-3"><div class="kpi-card"><i class="pi pi-send mr-2" />{{ t('transit.kpi.active') }}<h2 class="m-0 mt-2">{{ activeCount }}</h2></div></div>
      <div class="col-12 md:col-3"><div class="kpi-card"><i class="pi pi-directions-alt mr-2" />{{ t('transit.kpi.deviated') }}<h2 class="m-0 mt-2">{{ deviatedCount }}</h2></div></div>
      <div class="col-12 md:col-3"><div class="kpi-card"><i class="pi pi-stopwatch mr-2" />{{ t('transit.kpi.stopped') }}<h2 class="m-0 mt-2">{{ stoppedCount }}</h2></div></div>
      <div class="col-12 md:col-3"><div class="kpi-card"><i class="pi pi-bell mr-2" />{{ t('transit.kpi.pending') }}<h2 class="m-0 mt-2">{{ pendingNotificationsCount }}</h2></div></div>
    </div>

    <div class="grid">
      <div class="col-12 xl:col-5">
        <pv-card>
          <template #title>{{ t('transit.list.title') }}</template>
          <template #content>
            <pv-data-table
                v-model:selection="tableSelection"
                :value="routes"
                :loading="!routesLoaded"
                selection-mode="single"
                data-key="id"
                striped-rows
                class="p-datatable-sm"
            >
              <template #empty>{{ t('transit.list.empty') }}</template>
              <pv-column :header="t('transit.table.route')">
                <template #body="{data}">
                  <div class="font-bold">{{ data.id }}</div>
                  <small class="text-secondary">{{ data.dispatchId }}</small>
                </template>
              </pv-column>
              <pv-column field="vehiclePlate" :header="t('transit.table.truck')" />
              <pv-column :header="t('transit.table.destination')">
                <template #body="{data}">{{ data.destination.name }}</template>
              </pv-column>
              <pv-column :header="t('transit.table.status')">
                <template #body="{data}">
                  <pv-tag :value="t(`transit.status.${data.status}`)" :severity="routeStatusSeverity(data.status)" />
                </template>
              </pv-column>
              <pv-column :header="t('transit.table.lastUpdate')">
                <template #body="{data}">{{ formatTime(data.currentPosition?.reportedAt) }}</template>
              </pv-column>
            </pv-data-table>
          </template>
        </pv-card>
      </div>

      <div class="col-12 xl:col-7">
        <pv-card>
          <template #title>{{ t('transit.map.title') }}</template>
          <template #content>
            <p v-if="!selectedRoute" class="text-secondary m-0">{{ t('transit.map.selectRoute') }}</p>
            <template v-else>
              <div class="route-header mb-3">
                <div class="flex align-items-center gap-2 mb-2">
                  <span class="route-id">{{ selectedRoute.id }}</span>
                  <pv-tag :value="t(`transit.status.${selectedRoute.status}`)" :severity="routeStatusSeverity(selectedRoute.status)" />
                  <span class="text-secondary">· {{ selectedRoute.dispatchId }} · {{ selectedRoute.vehiclePlate }}</span>
                </div>
                <div class="grid summary">
                  <div class="col-6 md:col-3"><small>{{ t('transit.summary.origin') }}</small><div>{{ selectedRoute.originName }}</div></div>
                  <div class="col-6 md:col-3"><small>{{ t('transit.summary.destination') }}</small><div>{{ selectedRoute.destination.name }}</div></div>
                  <div class="col-6 md:col-3"><small>{{ t('transit.summary.departure') }}</small><div>{{ formatDateTime(selectedRoute.startedAt) }}</div></div>
                  <div class="col-6 md:col-3" v-if="selectedRoute.arrivedAt"><small>{{ t('transit.summary.arrivedAt') }}</small><div>{{ formatDateTime(selectedRoute.arrivedAt) }}</div></div>
                  <div class="col-6 md:col-3" v-else><small>{{ t('transit.summary.eta') }}</small><div>{{ formatDateTime(selectedRoute.estimatedArrival) }}</div></div>
                  <div class="col-6 md:col-3"><small>{{ t('transit.summary.distance') }}</small><div>{{ formatKm(selectedRoute.travelledDistanceMeters) }}</div></div>
                  <div class="col-6 md:col-3"><small>{{ t('transit.summary.positions') }}</small><div>{{ selectedRoute.positions.length }}</div></div>
                </div>
              </div>

              <div class="map-container">
                <l-map ref="map" :zoom="12" :center="mapCenter" :use-global-leaflet="false" @ready="fitToRoute">
                  <l-tile-layer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      layer-type="base"
                      name="OpenStreetMap"
                      attribution="&copy; OpenStreetMap contributors"
                  />
                  <l-circle
                      :lat-lng="toLatLng(selectedRoute.destination)"
                      :radius="selectedRoute.destination.radiusMeters"
                      :color="palette.accent"
                      :fill-color="palette.accent"
                      :fill-opacity="0.25"
                      :weight="2"
                  >
                    <l-popup>{{ t('transit.map.destination') }}: {{ selectedRoute.destination.name }}</l-popup>
                  </l-circle>
                  <l-polyline :lat-lngs="plannedLatLngs" :color="palette.primaryLight" :weight="4" :opacity="0.6" dash-array="8 8" />
                  <l-polyline :lat-lngs="travelledLatLngs" :color="palette.primary" :weight="5" />
                  <l-circle-marker
                      v-for="alert in alertPoints"
                      :key="alert.id"
                      :lat-lng="toLatLng(alert)"
                      :radius="7"
                      :color="palette.error"
                      :fill-color="palette.error"
                      :fill-opacity="0.9"
                  >
                    <l-popup>{{ t(`transit.alerts.type.${alert.type}`) }} · {{ formatTime(alert.detectedAt) }}</l-popup>
                  </l-circle-marker>
                  <l-circle-marker
                      v-if="selectedRoute.currentPosition"
                      :lat-lng="toLatLng(selectedRoute.currentPosition)"
                      :radius="10"
                      :color="palette.surface"
                      :weight="3"
                      :fill-color="palette.primary"
                      :fill-opacity="1"
                  >
                    <l-popup>
                      <strong>{{ selectedRoute.vehiclePlate }}</strong><br />
                      {{ t('transit.map.speed') }}: {{ selectedRoute.currentPosition.speedKmh }} km/h<br />
                      {{ formatDateTime(selectedRoute.currentPosition.reportedAt) }}
                    </l-popup>
                  </l-circle-marker>
                </l-map>
              </div>
              <div class="legend mt-2">
                <span><i class="legend-line dashed" :style="{borderColor: palette.primaryLight}" />{{ t('transit.map.planned') }}</span>
                <span><i class="legend-line" :style="{borderColor: palette.primary}" />{{ t('transit.map.travelled') }}</span>
                <span><i class="legend-dot" :style="{background: palette.primary}" />{{ t('transit.map.current') }}</span>
                <span><i class="legend-dot" :style="{background: palette.accent}" />{{ t('transit.map.destination') }}</span>
              </div>

              <div class="simulation mt-4">
                <h3 class="m-0 mb-1">{{ t('transit.simulation.title') }}</h3>
                <p class="text-secondary mt-0 mb-3">{{ t('transit.simulation.hint') }}</p>
                <div class="flex flex-wrap gap-2">
                  <pv-button :label="t('transit.simulation.onRoute')" icon="pi pi-map-marker" class="btn-primary"
                             :disabled="isBusy || !selectedRoute.isActive" @click="simulate(SIMULATION_MODE.ON_ROUTE)" />
                  <pv-button :label="t('transit.simulation.deviation')" icon="pi pi-directions-alt" class="btn-secondary"
                             :disabled="isBusy || !selectedRoute.isActive" @click="simulate(SIMULATION_MODE.DEVIATION)" />
                  <pv-button :label="t('transit.simulation.stop')" icon="pi pi-stopwatch" class="btn-secondary"
                             :disabled="isBusy || !selectedRoute.isActive" @click="simulate(SIMULATION_MODE.STOP)" />
                  <pv-button :label="t('transit.simulation.signalLost')" icon="pi pi-wifi" class="btn-secondary"
                             :disabled="isBusy || !selectedRoute.isActive || selectedRoute.status === ROUTE_STATUS.SIGNAL_LOST" @click="simulateSignalLost" />
                </div>
              </div>

              <div class="alerts mt-4">
                <h3 class="m-0 mb-3">{{ t('transit.alerts.title') }}</h3>
                <p v-if="!alertsNewestFirst.length" class="text-secondary m-0">{{ t('transit.alerts.empty') }}</p>
                <pv-timeline v-else :value="alertsNewestFirst">
                  <template #opposite="{item}"><small class="text-secondary">{{ formatTime(item.detectedAt) }}</small></template>
                  <template #content="{item}">
                    <div class="flex flex-wrap align-items-center gap-2 mb-1">
                      <pv-tag :value="t(`transit.alerts.type.${item.type}`)" :severity="transitAlertSeverity(item.type)" />
                      <small v-if="alertDetail(item)">{{ alertDetail(item) }}</small>
                    </div>
                    <pv-button v-if="item.isPendingNotification" :label="t('transit.alerts.notify')" icon="pi pi-bell"
                               class="p-button-sm btn-accent mb-3" :disabled="isBusy" @click="notifySite(item.id)" />
                    <small v-else-if="item.notifiedAt" class="notified mb-3 block">
                      <i class="pi pi-check mr-1" />{{ t('transit.alerts.notified') }} · {{ formatTime(item.notifiedAt) }}
                    </small>
                  </template>
                </pv-timeline>
              </div>
            </template>
          </template>
        </pv-card>
      </div>
    </div>

    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>
  </div>
</template>

<style scoped>
.kpi-card {
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--radius-actionable);
  background-color: var(--color-surface);
  padding: var(--sp-16);
}

.text-secondary {
  color: var(--color-text-secondary);
}

.route-id {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.summary small {
  color: var(--color-text-secondary);
}

.map-container {
  height: 420px;
  border-radius: var(--radius-actionable);
  overflow: hidden;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-16);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.legend-line {
  display: inline-block;
  width: 24px;
  margin-right: var(--sp-8);
  vertical-align: middle;
  border-top: 3px solid;
}

.legend-line.dashed {
  border-top-style: dashed;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: var(--sp-8);
  border-radius: 50%;
}

.notified {
  color: var(--color-success);
}

:deep(.p-timeline-event-opposite) {
  flex: 0 0 4rem;
}

@media (max-width: 768px) {
  .map-container {
    height: 50vh;
    min-height: 320px;
  }
}
</style>
