<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useReceptionStore } from '../../application/reception.store.js';
import { RECEPTION_STATUS } from '../../domain/reception-status.js';

const props = defineProps({
  onRegisterClick: {
    type: Function,
    default: () => {}
  }
});

const emit = defineEmits(['reportIssue', 'editReception', 'viewGallery', 'registerArrival']);

const { t } = useI18n();
const receptionStore = useReceptionStore();

const timeFilter = ref('last7days');
const isDetailsOpen = ref(true);

const timeFilterOptions = [
  { label: 'Últimos 7 días (Last 7 days)', value: 'last7days' },
  { label: 'Hoy (Today)', value: 'today' },
  { label: 'Este mes (This month)', value: 'month' },
  { label: 'Todos (All)', value: 'all' }
];

const selectedItem = computed(() => {
  return receptionStore.selectedReception || receptionStore.receptions[0] || null;
});

function selectRow(item) {
  receptionStore.selectReception(item);
  isDetailsOpen.value = true;
}

function closeDetails() {
  isDetailsOpen.value = false;
}

function getStatusBadgeClass(status) {
  if (status === RECEPTION_STATUS.VERIFIED_CONFORMANT || status === 'COMPLETED') {
    return 'badge-status-completed';
  }
  if (status === RECEPTION_STATUS.VERIFIED_DISCREPANT || status === 'PARTIAL' || status === 'WITH_DIFFERENCE') {
    return 'badge-status-partial';
  }
  if (status === 'UNDER_REVIEW') {
    return 'badge-status-review';
  }
  return 'badge-status-arrived';
}

function getStatusLabel(status) {
  if (status === RECEPTION_STATUS.VERIFIED_CONFORMANT || status === 'COMPLETED') {
    return t('receptions.status.completed');
  }
  if (status === RECEPTION_STATUS.VERIFIED_DISCREPANT || status === 'PARTIAL' || status === 'WITH_DIFFERENCE') {
    return t('receptions.status.partial');
  }
  if (status === 'UNDER_REVIEW') {
    return t('receptions.status.underReview');
  }
  return t('receptions.status.inTransit');
}

// Cálculo del porcentaje de la barra de progreso de cantidades
const comparisonPercentages = computed(() => {
  if (!selectedItem.value) return { sent: 100, received: 100 };
  const dispatched = selectedItem.value.totalDispatchedQuantity || 1;
  const received = selectedItem.value.totalReceivedQuantity || 0;
  const max = Math.max(dispatched, received, 1);
  return {
    sent: Math.min(100, (dispatched / max) * 100),
    received: Math.min(100, (received / max) * 100)
  };
});
</script>

<template>
  <div class="site-manager-view">
    <!-- 3 KPI Cards (§4.4.3 Mockup 4receptions.png) -->
    <div class="kpi-grid mb-4">
      <!-- Card 1: Today's Receptions -->
      <div class="kpi-card">
        <div class="kpi-icon-circle bg-amber-light">
          <i class="pi pi-box text-amber"></i>
        </div>
        <div class="kpi-info">
          <span class="kpi-label">{{ t('receptions.kpi.todayReceptions') }}</span>
          <div class="kpi-value-row">
            <span class="kpi-value">{{ receptionStore.todayReceptionsCount }}</span>
            <span class="kpi-trend trend-up">
              <i class="pi pi-arrow-up text-xs mr-1"></i>+33% {{ t('receptions.kpi.vsYesterday') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Card 2: Completed -->
      <div class="kpi-card">
        <div class="kpi-icon-circle bg-green-light">
          <i class="pi pi-check-circle text-green"></i>
        </div>
        <div class="kpi-info">
          <span class="kpi-label">{{ t('receptions.kpi.completed') }}</span>
          <div class="kpi-value-row">
            <span class="kpi-value">{{ receptionStore.completedCount }}</span>
            <span class="kpi-trend trend-up">
              <i class="pi pi-arrow-up text-xs mr-1"></i>+25% {{ t('receptions.kpi.vsPrevWeek') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Card 3: Partial / With Discrepancy -->
      <div class="kpi-card">
        <div class="kpi-icon-circle bg-blue-light">
          <i class="pi pi-chart-pie text-blue"></i>
        </div>
        <div class="kpi-info">
          <span class="kpi-label">{{ t('receptions.kpi.partial') }}</span>
          <div class="kpi-value-row">
            <span class="kpi-value">{{ receptionStore.discrepantCount }}</span>
            <span class="kpi-trend trend-neutral">
              <i class="pi pi-arrow-up text-xs mr-1"></i>+0% {{ t('receptions.kpi.vsPrevWeek') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content: Left Tables + Right Details Panel -->
    <div class="content-layout">
      <!-- Columna Izquierda: Tablas -->
      <div class="tables-column" :class="{ 'with-details': isDetailsOpen && selectedItem }">
        <!-- Tabla 1: Upcoming Arrivals (In Transit) -->
        <div class="section-card mb-4">
          <div class="card-header flex justify-content-between align-items-center mb-3">
            <h2 class="section-title m-0">{{ t('receptions.arrivals.title') }}</h2>
            <a href="javascript:void(0)" class="view-all-link font-medium">{{ t('common.viewAll') }}</a>
          </div>

          <div class="table-responsive">
            <table class="clean-table w-full">
              <thead>
                <tr>
                  <th>{{ t('receptions.arrivals.id') }}</th>
                  <th>{{ t('receptions.arrivals.material') }}</th>
                  <th>{{ t('receptions.arrivals.origin') }}</th>
                  <th>{{ t('receptions.arrivals.truck') }}</th>
                  <th>{{ t('receptions.arrivals.eta') }}</th>
                  <th>{{ t('receptions.arrivals.status') }}</th>
                  <th class="text-right">{{ t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="arrival in receptionStore.upcomingArrivals" :key="arrival.id">
                  <td class="font-semibold text-primary">
                    <i class="pi pi-truck mr-1 text-secondary"></i>
                    {{ arrival.id }}
                  </td>
                  <td>{{ arrival.material }}</td>
                  <td>{{ arrival.origin }}</td>
                  <td>{{ arrival.truck }}</td>
                  <td>{{ arrival.estimatedArrival }}</td>
                  <td>
                    <span
                      class="status-pill"
                      :class="arrival.status === 'In transit' ? 'pill-in-transit' : 'pill-scheduled'"
                    >
                      <span class="status-dot"></span>
                      {{ arrival.status }}
                    </span>
                  </td>
                  <td class="text-right">
                    <pv-button
                      :label="t('receptions.arrivals.registerAction')"
                      class="p-button-text p-button-sm btn-action"
                      @click="emit('registerArrival', arrival)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tabla 2: Registered Receptions -->
        <div class="section-card">
          <div class="card-header flex justify-content-between align-items-center mb-3">
            <h2 class="section-title m-0">{{ t('receptions.registered.title') }}</h2>
            <pv-select
              v-model="timeFilter"
              :options="timeFilterOptions"
              optionLabel="label"
              optionValue="value"
              class="time-select p-inputtext-sm"
            />
          </div>

          <div class="table-responsive">
            <table class="clean-table w-full">
              <thead>
                <tr>
                  <th>{{ t('receptions.table.id') }}</th>
                  <th>{{ t('receptions.table.material') }}</th>
                  <th>{{ t('receptions.table.sent') }}</th>
                  <th>{{ t('receptions.table.received') }}</th>
                  <th>{{ t('receptions.table.diff') }}</th>
                  <th>{{ t('receptions.table.status') }}</th>
                  <th>{{ t('receptions.table.responsible') }}</th>
                  <th>{{ t('receptions.table.date') }}</th>
                  <th class="text-right">{{ t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="rec in receptionStore.filteredReceptions"
                  :key="rec.id"
                  :class="{ 'row-selected': selectedItem && selectedItem.id === rec.id }"
                  @click="selectRow(rec)"
                  class="clickable-row"
                >
                  <td class="font-bold text-primary">
                    <i class="pi pi-box mr-1 text-secondary"></i>
                    {{ rec.id }}
                  </td>
                  <td>{{ rec.primaryMaterial }}</td>
                  <td>{{ rec.items?.[0] ? `${rec.items[0].dispatchedQuantity} ${rec.items[0].unit}` : '-' }}</td>
                  <td>{{ rec.items?.[0] ? `${rec.items[0].receivedQuantity} ${rec.items[0].unit}` : '-' }}</td>
                  <td>
                    <span :class="rec.totalDifference > 0 ? 'text-red font-bold' : 'text-secondary font-medium'">
                      {{ rec.totalDifference > 0 ? `-${rec.totalDifference} ${rec.items?.[0]?.unit || 't'}` : '0' }}
                    </span>
                  </td>
                  <td>
                    <span class="status-pill" :class="getStatusBadgeClass(rec.status)">
                      <span class="status-dot"></span>
                      {{ getStatusLabel(rec.status) }}
                    </span>
                  </td>
                  <td>{{ rec.verifiedByUserName || 'Juan Pérez' }}</td>
                  <td class="text-secondary text-xs">
                    {{ new Date(rec.arrivedAt).toLocaleDateString() }} {{ new Date(rec.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                  </td>
                  <td class="text-right">
                    <pv-button
                      :label="t('common.viewDetails')"
                      class="p-button-text p-button-sm btn-action"
                      @click.stop="selectRow(rec)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Panel de Detalle (Reception Details) -->
      <aside v-if="isDetailsOpen && selectedItem" class="details-panel">
        <div class="panel-header flex justify-content-between align-items-center mb-3">
          <h3 class="panel-title m-0">{{ t('receptions.details.title') }}</h3>
          <pv-button
            icon="pi pi-times"
            class="p-button-text p-button-rounded p-button-sm"
            @click="closeDetails"
          />
        </div>

        <!-- Header Card del Ítem Seleccionado -->
        <div class="selected-hero mb-3">
          <div class="hero-icon-box">
            <i class="pi pi-box"></i>
          </div>
          <div class="hero-body">
            <div class="flex align-items-center gap-2 mb-1">
              <span class="hero-id">{{ selectedItem.id }}</span>
              <span class="status-pill" :class="getStatusBadgeClass(selectedItem.status)">
                {{ getStatusLabel(selectedItem.status) }}
              </span>
            </div>
            <h4 class="hero-material m-0">{{ selectedItem.primaryMaterial }}</h4>
            <span class="hero-sub">{{ selectedItem.dispatchId }} · {{ selectedItem.origin }}</span>
          </div>
        </div>

        <!-- Metadatos de la entrega -->
        <div class="metadata-grid mb-3">
          <div class="meta-row">
            <span class="meta-label">{{ t('receptions.details.origin') }}</span>
            <span class="meta-value">{{ selectedItem.origin || '-' }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">{{ t('receptions.details.driverGuide') }}</span>
            <span class="meta-value">{{ selectedItem.deliveryGuideNumber || '-' }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">{{ t('receptions.details.truck') }}</span>
            <span class="meta-value">{{ selectedItem.truckPlate || '-' }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">{{ t('receptions.details.dateTime') }}</span>
            <span class="meta-value">{{ new Date(selectedItem.arrivedAt).toLocaleString() }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">{{ t('receptions.details.responsible') }}</span>
            <span class="meta-value">{{ selectedItem.verifiedByUserName || 'Juan Pérez' }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">{{ t('receptions.details.location') }}</span>
            <span class="meta-value">{{ selectedItem.siteName || 'Obra' }}</span>
          </div>
        </div>

        <!-- Observaciones -->
        <div class="observations-box mb-4">
          <label class="meta-label">{{ t('receptions.details.observations') }}</label>
          <p class="obs-text m-0">{{ selectedItem.observations || t('receptions.details.noObservations') }}</p>
        </div>

        <!-- Quantity Comparison (§4.4.3) -->
        <div class="quantity-comparison-card mb-4">
          <h4 class="comparison-title mb-3">{{ t('receptions.comparison.title') }}</h4>
          <div class="comparison-metrics-row mb-3">
            <div class="metric-box">
              <span class="comp-label">{{ t('receptions.table.sent') }}</span>
              <span class="comp-val">{{ selectedItem.totalDispatchedQuantity }} {{ selectedItem.items?.[0]?.unit || 't' }}</span>
            </div>
            <div class="metric-box">
              <span class="comp-label">{{ t('receptions.table.received') }}</span>
              <span class="comp-val">{{ selectedItem.totalReceivedQuantity }} {{ selectedItem.items?.[0]?.unit || 't' }}</span>
            </div>
            <div class="metric-box">
              <span class="comp-label">{{ t('receptions.table.diff') }}</span>
              <span class="comp-val font-bold" :class="selectedItem.totalDifference > 0 ? 'text-red' : 'text-green'">
                {{ selectedItem.totalDifference > 0 ? `-${selectedItem.totalDifference}` : '0' }} {{ selectedItem.items?.[0]?.unit || 't' }}
              </span>
            </div>
          </div>

          <!-- Barras de comparación visuales -->
          <div class="bars-container">
            <div class="bar-row mb-2">
              <div class="bar-track">
                <div class="bar-fill bar-sent" :style="{ width: `${comparisonPercentages.sent}%` }"></div>
              </div>
              <span class="bar-caption">{{ selectedItem.totalDispatchedQuantity }} {{ selectedItem.items?.[0]?.unit || 't' }}</span>
            </div>
            <div class="bar-row">
              <div class="bar-track">
                <div class="bar-fill bar-received" :style="{ width: `${comparisonPercentages.received}%` }"></div>
              </div>
              <span class="bar-caption">{{ selectedItem.totalReceivedQuantity }} {{ selectedItem.items?.[0]?.unit || 't' }}</span>
            </div>
          </div>
        </div>

        <!-- Reception Checklist (§4.4.3) -->
        <div class="checklist-card mb-4">
          <h4 class="checklist-title mb-2">{{ t('receptions.checklist.title') }}</h4>
          <ul class="checklist-items">
            <li class="check-row" :class="{ 'checked': selectedItem.checklist?.materialGoodCondition }">
              <i :class="selectedItem.checklist?.materialGoodCondition ? 'pi pi-check-square text-green' : 'pi pi-stop text-secondary'"></i>
              <span>{{ t('receptions.checklist.goodCondition') }}</span>
            </li>
            <li class="check-row" :class="{ 'checked': selectedItem.checklist?.quantityVerified }">
              <i :class="selectedItem.checklist?.quantityVerified ? 'pi pi-check-square text-green' : 'pi pi-stop text-secondary'"></i>
              <span>{{ t('receptions.checklist.verifiedQuantity') }}</span>
            </li>
            <li class="check-row" :class="{ 'checked': selectedItem.checklist?.deliveryGuideReceived }">
              <i :class="selectedItem.checklist?.deliveryGuideReceived ? 'pi pi-check-square text-green' : 'pi pi-stop text-secondary'"></i>
              <span>{{ t('receptions.checklist.guideReceived') }}</span>
            </li>
            <li class="check-row" :class="{ 'checked': selectedItem.checklist?.photographicEvidence }">
              <i :class="selectedItem.checklist?.photographicEvidence ? 'pi pi-check-square text-green' : 'pi pi-stop text-secondary'"></i>
              <div class="flex justify-content-between align-items-center w-full">
                <span>{{ t('receptions.checklist.photoEvidence') }}</span>
                <a
                  v-if="selectedItem.evidences?.length"
                  href="javascript:void(0)"
                  class="evidence-link text-xs font-semibold"
                  @click="emit('viewGallery', selectedItem)"
                >
                  {{ t('receptions.checklist.viewPhotos') }} ({{ selectedItem.evidences.length }})
                </a>
              </div>
            </li>
            <li class="check-row" :class="{ 'checked': selectedItem.checklist?.observationsRecorded }">
              <i :class="selectedItem.checklist?.observationsRecorded ? 'pi pi-check-square text-green' : 'pi pi-stop text-secondary'"></i>
              <span>{{ t('receptions.checklist.observationsRecorded') }}</span>
            </li>
          </ul>
        </div>

        <!-- Acciones en el panel de detalle -->
        <div class="panel-actions flex gap-2">
          <pv-button
            :label="t('receptions.actions.reportIssue')"
            icon="pi pi-exclamation-circle"
            class="btn-secondary w-full"
            @click="emit('reportIssue', selectedItem)"
          />
          <pv-button
            :label="selectedItem.hasDiscrepancy ? t('receptions.actions.editReception') : t('receptions.actions.confirmReception')"
            icon="pi pi-pencil"
            class="btn-accent w-full"
            @click="emit('editReception', selectedItem)"
          />
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.site-manager-view {
  width: 100%;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--sp-16);
}

.kpi-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-actionable);
  box-shadow: var(--elevation-1);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.kpi-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.bg-amber-light { background-color: #FEF3C7; }
.text-amber { color: #D97706; }
.bg-green-light { background-color: #DCFCE7; }
.text-green { color: #16A34A; }
.bg-blue-light { background-color: #E0F2FE; }
.text-blue { color: #0284C7; }
.text-red { color: #DC2626; }

.kpi-info {
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.kpi-value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.kpi-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-main);
}

.kpi-trend {
  font-size: 12px;
  font-weight: 500;
}

.trend-up { color: #16A34A; }
.trend-neutral { color: var(--color-text-secondary); }

/* Layout */
.content-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.tables-column {
  flex: 1;
  min-width: 0;
}

.tables-column.with-details {
  flex: 1 1 65%;
}

.section-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-actionable);
  box-shadow: var(--elevation-1);
  padding: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
}

.view-all-link {
  color: var(--color-primary-light);
  font-size: 13px;
  text-decoration: none;
}

.view-all-link:hover {
  text-decoration: underline;
}

.time-select {
  width: 220px;
}

/* Tablas */
.clean-table {
  border-collapse: collapse;
  font-size: 13px;
}

.clean-table th {
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  color: var(--color-text-secondary);
  background-color: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
}

.clean-table td {
  padding: 12px;
  border-bottom: 1px solid #F1F5F9;
  vertical-align: middle;
}

.clickable-row {
  cursor: pointer;
  transition: background-color var(--transition-default);
}

.clickable-row:hover {
  background-color: #F8FAFC;
}

.clickable-row.row-selected {
  background-color: #FFFBEB;
}

/* Status Pills */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.pill-in-transit {
  background-color: #FEF3C7;
  color: #B45309;
}
.pill-in-transit .status-dot { background-color: #F59E0B; }

.pill-scheduled {
  background-color: #F1F5F9;
  color: #475569;
}
.pill-scheduled .status-dot { background-color: #94A3B8; }

.badge-status-completed {
  background-color: #DCFCE7;
  color: #15803D;
}
.badge-status-completed .status-dot { background-color: #22C55E; }

.badge-status-partial {
  background-color: #E0F2FE;
  color: #0369A1;
}
.badge-status-partial .status-dot { background-color: #0EA5E9; }

.badge-status-review {
  background-color: #FEE2E2;
  color: #B91C1C;
}
.badge-status-review .status-dot { background-color: #EF4444; }

.badge-status-arrived {
  background-color: #FEF9C3;
  color: #A16207;
}
.badge-status-arrived .status-dot { background-color: #EAB308; }

.btn-action {
  font-weight: 500;
  color: var(--color-primary-light);
}

/* Panel Lateral de Detalle (Reception Details) */
.details-panel {
  flex: 0 0 360px;
  width: 360px;
  background-color: var(--color-surface);
  border-radius: var(--radius-actionable);
  box-shadow: var(--elevation-2);
  padding: 20px;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
}

.selected-hero {
  display: flex;
  gap: 12px;
  padding: 12px;
  background-color: #F8FAFC;
  border-radius: var(--radius-actionable);
  border: 1px solid #E2E8F0;
}

.hero-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.hero-body {
  display: flex;
  flex-direction: column;
}

.hero-id {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-primary);
}

.hero-material {
  font-size: 14px;
  font-weight: 600;
}

.hero-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.metadata-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.meta-label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.meta-value {
  color: var(--color-text-main);
  font-weight: 500;
  text-align: right;
}

.observations-box {
  background-color: #F9FAFB;
  padding: 10px;
  border-radius: var(--radius-actionable);
  border: 1px solid #E5E7EB;
}

.obs-text {
  font-size: 12px;
  color: var(--color-text-main);
  font-style: italic;
  margin-top: 4px;
}

/* Quantity Comparison */
.quantity-comparison-card {
  background-color: #F8FAFC;
  padding: 14px;
  border-radius: var(--radius-actionable);
  border: 1px solid #E2E8F0;
}

.comparison-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: var(--color-primary);
}

.comparison-metrics-row {
  display: flex;
  justify-content: space-between;
}

.metric-box {
  display: flex;
  flex-direction: column;
}

.comp-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  font-weight: 600;
}

.comp-val {
  font-size: 18px;
  font-weight: 700;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bar-track {
  flex: 1;
  height: 8px;
  background-color: #E2E8F0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bar-sent {
  background-color: #3B82F6;
}

.bar-received {
  background-color: #F59E0B;
}

.bar-caption {
  font-size: 11px;
  color: var(--color-text-secondary);
  min-width: 38px;
  text-align: right;
}

/* Checklist */
.checklist-card {
  background-color: #F8FAFC;
  padding: 14px;
  border-radius: var(--radius-actionable);
  border: 1px solid #E2E8F0;
}

.checklist-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: var(--color-primary);
}

.checklist-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.check-row.checked {
  color: var(--color-text-main);
  font-weight: 500;
}

.evidence-link {
  color: var(--color-primary-light);
  text-decoration: underline;
}

@media (max-width: 1024px) {
  .content-layout {
    flex-direction: column;
  }
  .details-panel {
    width: 100%;
    flex: auto;
  }
}
</style>
