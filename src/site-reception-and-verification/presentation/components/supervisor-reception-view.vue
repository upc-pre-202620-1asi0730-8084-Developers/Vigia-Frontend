<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useReceptionStore } from '../../application/reception.store.js';
import { RECEPTION_STATUS } from '../../domain/reception-status.js';

const emit = defineEmits(['reportDiscrepancy', 'confirmReception', 'viewGallery']);

const { t } = useI18n();
const receptionStore = useReceptionStore();

// Filtros
const selectedProject = ref('all');
const selectedStatus = ref('all');
const dateRange = ref('01/04/2025 - 14/04/2025');
const currentPage = ref(1);
const rowsPerPage = ref(10);

const projectOptions = [
  { label: 'Todos los proyectos (All projects)', value: 'all' },
  { label: 'Torre A', value: 'Torre A' },
  { label: 'Planta Norte', value: 'Planta Norte' },
  { label: 'Centro Comercial Sur', value: 'Centro Comercial Sur' },
  { label: 'Puente Río', value: 'Puente Río' },
  { label: 'Hospital Central', value: 'Hospital Central' },
  { label: 'Residencial Valle', value: 'Residencial Valle' }
];

const statusOptions = [
  { label: 'Todos los estados (All statuses)', value: 'all' },
  { label: 'Completado (Completed)', value: RECEPTION_STATUS.VERIFIED_CONFORMANT },
  { label: 'Con diferencia (With difference)', value: RECEPTION_STATUS.VERIFIED_DISCREPANT },
  { label: 'Pendiente (Pending / Arrived)', value: RECEPTION_STATUS.ARRIVED }
];

const rowsPerPageOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 }
];

// Recepción seleccionada para el panel lateral
const selectedItem = computed(() => {
  return receptionStore.selectedReception || receptionStore.receptions.find(r => r.id === 'REC-088') || receptionStore.receptions[0] || null;
});

function selectRow(item) {
  receptionStore.selectReception(item);
}

function clearFilters() {
  selectedProject.value = 'all';
  selectedStatus.value = 'all';
  receptionStore.filterProject = '';
  receptionStore.filterStatus = '';
}

function applyFilters() {
  receptionStore.filterProject = selectedProject.value;
  receptionStore.filterStatus = selectedStatus.value;
}

function getStatusBadgeClass(status) {
  if (status === RECEPTION_STATUS.VERIFIED_CONFORMANT || status === 'COMPLETED') {
    return 'pill-completed';
  }
  if (status === RECEPTION_STATUS.VERIFIED_DISCREPANT || status === 'PARTIAL' || status === 'WITH_DIFFERENCE') {
    return 'pill-difference';
  }
  return 'pill-pending';
}

function getStatusLabel(status) {
  if (status === RECEPTION_STATUS.VERIFIED_CONFORMANT || status === 'COMPLETED') {
    return t('receptions.status.completed');
  }
  if (status === RECEPTION_STATUS.VERIFIED_DISCREPANT || status === 'PARTIAL' || status === 'WITH_DIFFERENCE') {
    return t('receptions.status.withDifference');
  }
  return t('receptions.status.pending');
}
</script>

<template>
  <div class="supervisor-view">
    <!-- 4 KPI Cards (§4.4.3 Mockup Supervisor) -->
    <div class="supervisor-kpi-grid mb-4">
      <!-- 1. Receptions today -->
      <div class="kpi-card">
        <div class="kpi-icon-circle bg-amber-light">
          <i class="pi pi-box text-amber"></i>
        </div>
        <div class="kpi-info">
          <span class="kpi-label">{{ t('receptions.supervisor.kpiToday') }}</span>
          <div class="kpi-value-row">
            <span class="kpi-value">12</span>
            <span class="kpi-trend trend-up">
              <i class="pi pi-arrow-up text-xs mr-1"></i>+33% {{ t('receptions.supervisor.vsPrevDay') }}
            </span>
          </div>
        </div>
      </div>

      <!-- 2. Pending -->
      <div class="kpi-card">
        <div class="kpi-icon-circle bg-blue-light">
          <i class="pi pi-clock text-blue"></i>
        </div>
        <div class="kpi-info">
          <span class="kpi-label">{{ t('receptions.supervisor.kpiPending') }}</span>
          <div class="kpi-value-row">
            <span class="kpi-value">5</span>
            <span class="kpi-trend trend-up">
              <i class="pi pi-arrow-up text-xs mr-1"></i>+67% {{ t('receptions.supervisor.vsPrevDay') }}
            </span>
          </div>
        </div>
      </div>

      <!-- 3. With discrepancies -->
      <div class="kpi-card">
        <div class="kpi-icon-circle bg-red-light">
          <i class="pi pi-exclamation-triangle text-red"></i>
        </div>
        <div class="kpi-info">
          <span class="kpi-label">{{ t('receptions.supervisor.kpiDiscrepancies') }}</span>
          <div class="kpi-value-row">
            <span class="kpi-value">3</span>
            <span class="kpi-trend trend-up">
              <i class="pi pi-arrow-up text-xs mr-1"></i>+50% {{ t('receptions.supervisor.vsPrevDay') }}
            </span>
          </div>
        </div>
      </div>

      <!-- 4. Completed -->
      <div class="kpi-card">
        <div class="kpi-icon-circle bg-green-light">
          <i class="pi pi-check-circle text-green"></i>
        </div>
        <div class="kpi-info">
          <span class="kpi-label">{{ t('receptions.supervisor.kpiCompleted') }}</span>
          <div class="kpi-value-row">
            <span class="kpi-value">18</span>
            <span class="kpi-trend trend-up">
              <i class="pi pi-arrow-up text-xs mr-1"></i>+29% {{ t('receptions.supervisor.vsPrevDay') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Barra de Filtros (§4.4.3) -->
    <div class="filter-card mb-4">
      <div class="filter-row flex flex-wrap align-items-center gap-3">
        <!-- Proyecto -->
        <div class="filter-group">
          <label class="filter-label">{{ t('receptions.supervisor.filterProject') }}</label>
          <pv-select
            v-model="selectedProject"
            :options="projectOptions"
            optionLabel="label"
            optionValue="value"
            class="filter-select"
          />
        </div>

        <!-- Estado -->
        <div class="filter-group">
          <label class="filter-label">{{ t('receptions.supervisor.filterStatus') }}</label>
          <pv-select
            v-model="selectedStatus"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            class="filter-select"
          />
        </div>

        <!-- Rango de fechas -->
        <div class="filter-group">
          <label class="filter-label">{{ t('receptions.supervisor.dateRange') }}</label>
          <div class="date-input-wrap">
            <i class="pi pi-calendar mr-2 text-secondary"></i>
            <pv-input-text v-model="dateRange" class="date-input" />
          </div>
        </div>

        <!-- Stock alerts button -->
        <div class="filter-actions flex align-items-center gap-3 ml-auto pt-3">
          <pv-button
            :label="t('receptions.supervisor.stockAlerts')"
            icon="pi pi-exclamation-triangle"
            class="p-button-outlined p-button-sm btn-stock-alerts"
          />
          <a href="javascript:void(0)" class="clear-filters-link" @click="clearFilters">
            {{ t('receptions.supervisor.clearFilters') }}
          </a>
          <pv-button
            :label="t('receptions.supervisor.applyFilters')"
            icon="pi pi-filter"
            class="btn-accent p-button-sm"
            @click="applyFilters"
          />
        </div>
      </div>
    </div>

    <!-- Master / Detail Section -->
    <div class="supervisor-content-layout">
      <!-- Master Table: Receptions List -->
      <div class="master-table-card">
        <div class="card-header flex justify-content-between align-items-center mb-3">
          <h2 class="section-title m-0">{{ t('receptions.supervisor.tableTitle') }}</h2>
          <span class="total-badge text-secondary font-medium">
            Total: {{ receptionStore.filteredReceptions.length }} {{ t('receptions.supervisor.receptionsCount') }}
          </span>
        </div>

        <div class="table-responsive">
          <table class="clean-table w-full">
            <thead>
              <tr>
                <th>{{ t('receptions.supervisor.colId') }}</th>
                <th>{{ t('receptions.supervisor.colProject') }}</th>
                <th>{{ t('receptions.supervisor.colDispatch') }}</th>
                <th>{{ t('receptions.supervisor.colReceivedDate') }}</th>
                <th>{{ t('receptions.supervisor.colReceivedBy') }}</th>
                <th>{{ t('receptions.supervisor.colStatus') }}</th>
                <th class="text-right">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="rec in receptionStore.filteredReceptions"
                :key="rec.id"
                :class="{ 'row-active-yellow': selectedItem && selectedItem.id === rec.id }"
                class="clickable-row"
                @click="selectRow(rec)"
              >
                <td class="font-bold text-primary">{{ rec.id }}</td>
                <td>{{ rec.siteName }}</td>
                <td>{{ rec.dispatchId }}</td>
                <td class="text-secondary text-xs">
                  {{ new Date(rec.arrivedAt).toLocaleDateString() }} {{ new Date(rec.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                </td>
                <td>{{ rec.verifiedByUserName || 'Ana López' }}</td>
                <td>
                  <span class="status-pill" :class="getStatusBadgeClass(rec.status)">
                    <span class="status-dot"></span>
                    {{ getStatusLabel(rec.status) }}
                  </span>
                </td>
                <td class="text-right">
                  <pv-button icon="pi pi-ellipsis-h" class="p-button-text p-button-rounded p-button-sm text-secondary" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación Mockup -->
        <div class="pagination-footer flex justify-content-between align-items-center mt-3 pt-3 border-top-1 surface-border">
          <span class="text-xs text-secondary">
            {{ t('receptions.supervisor.showing') }} 1-{{ Math.min(10, receptionStore.filteredReceptions.length) }} {{ t('receptions.supervisor.of') }} {{ receptionStore.filteredReceptions.length }}
          </span>
          <div class="pagination-controls flex align-items-center gap-1">
            <pv-button icon="pi pi-chevron-left" class="p-button-text p-button-sm" />
            <pv-button label="1" class="p-button-sm btn-page-active" />
            <pv-button label="2" class="p-button-text p-button-sm" />
            <pv-button label="3" class="p-button-text p-button-sm" />
            <pv-button icon="pi pi-chevron-right" class="p-button-text p-button-sm" />
          </div>
          <div class="rows-select-wrap flex align-items-center gap-2">
            <span class="text-xs text-secondary">{{ t('receptions.supervisor.rowsPerPage') }}</span>
            <pv-select
              v-model="rowsPerPage"
              :options="rowsPerPageOptions"
              optionLabel="label"
              optionValue="value"
              class="rows-select p-inputtext-sm"
            />
          </div>
        </div>
      </div>

      <!-- Detail Panel: Reception details (Right Side) -->
      <aside v-if="selectedItem" class="detail-side-panel">
        <div class="panel-header flex justify-content-between align-items-center mb-3">
          <h3 class="panel-title m-0">{{ t('receptions.supervisor.detailsTitle') }}</h3>
          <span class="panel-id-badge font-bold">{{ selectedItem.id }}</span>
        </div>

        <!-- Metadatos de cabecera -->
        <div class="meta-section mb-4">
          <div class="meta-item">
            <span class="meta-k">{{ t('receptions.supervisor.colProject') }}</span>
            <span class="meta-v">{{ selectedItem.siteName }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-k">{{ t('receptions.supervisor.colDispatch') }}</span>
            <span class="meta-v">{{ selectedItem.dispatchId }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-k">{{ t('receptions.supervisor.colReceivedDate') }}</span>
            <span class="meta-v">{{ new Date(selectedItem.arrivedAt).toLocaleDateString() }}, {{ new Date(selectedItem.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-k">{{ t('receptions.supervisor.colReceivedBy') }}</span>
            <span class="meta-v">{{ selectedItem.verifiedByUserName || 'Ana López' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-k">{{ t('receptions.supervisor.colStatus') }}</span>
            <span class="status-pill" :class="getStatusBadgeClass(selectedItem.status)">
              <span class="status-dot"></span>
              {{ getStatusLabel(selectedItem.status) }}
            </span>
          </div>
        </div>

        <!-- Tabla: Materials received (§4.4.3) -->
        <div class="materials-received-section mb-4">
          <div class="flex justify-content-between align-items-center mb-2">
            <h4 class="materials-title m-0">{{ t('receptions.supervisor.materialsReceived') }}</h4>
            <span class="text-xs text-secondary font-medium">
              Total items: {{ selectedItem.items?.length || 0 }}
            </span>
          </div>

          <div class="table-responsive">
            <table class="mini-table w-full">
              <thead>
                <tr>
                  <th>{{ t('receptions.table.material') }}</th>
                  <th class="text-right">{{ t('receptions.table.sent') }}</th>
                  <th class="text-right">{{ t('receptions.table.received') }}</th>
                  <th class="text-right">{{ t('receptions.table.diff') }}</th>
                  <th>{{ t('receptions.table.unit') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="it in selectedItem.items" :key="it.id">
                  <td class="font-medium text-main">{{ it.materialName }}</td>
                  <td class="text-right">{{ it.dispatchedQuantity }}</td>
                  <td class="text-right">{{ it.receivedQuantity }}</td>
                  <td class="text-right font-bold">
                    <span :class="it.difference > 0 ? 'text-red' : 'text-green'">
                      {{ it.difference > 0 ? `-${it.difference}` : '0' }}
                    </span>
                  </td>
                  <td class="text-secondary text-xs">{{ it.unit }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Evidencias adjuntas si las hubiera -->
        <div v-if="selectedItem.evidences?.length" class="evidences-mini-section mb-4">
          <div class="flex justify-content-between align-items-center mb-2">
            <span class="text-xs font-bold text-secondary uppercase">{{ t('receptions.discrepancy.evidenceTitle') }}</span>
            <a href="javascript:void(0)" class="text-xs font-semibold text-primary" @click="emit('viewGallery', selectedItem)">
              {{ t('receptions.checklist.viewPhotos') }} ({{ selectedItem.evidences.length }})
            </a>
          </div>
          <div class="flex gap-2">
            <img
              v-for="ev in selectedItem.evidences.slice(0, 3)"
              :key="ev.id"
              :src="ev.evidenceUrl"
              class="thumb-img border-round cursor-pointer"
              @click="emit('viewGallery', selectedItem)"
            />
          </div>
        </div>

        <!-- Botones de Acción del Supervisor (§4.4.3) -->
        <div class="supervisor-actions flex gap-2">
          <pv-button
            :label="t('receptions.supervisor.reportDiscrepancy')"
            icon="pi pi-camera"
            class="btn-secondary w-full"
            @click="emit('reportDiscrepancy', selectedItem)"
          />
          <pv-button
            :label="t('receptions.supervisor.confirmReception')"
            icon="pi pi-check"
            class="btn-accent w-full"
            @click="emit('confirmReception', selectedItem)"
          />
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.supervisor-view {
  width: 100%;
}

/* 4 KPI Grid */
.supervisor-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.bg-amber-light { background-color: #FEF3C7; }
.text-amber { color: #D97706; }
.bg-blue-light { background-color: #E0F2FE; }
.text-blue { color: #0284C7; }
.bg-red-light { background-color: #FEE2E2; }
.text-red { color: #DC2626; }
.bg-green-light { background-color: #DCFCE7; }
.text-green { color: #16A34A; }

.kpi-info {
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.kpi-value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.kpi-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-main);
}

.kpi-trend {
  font-size: 11px;
  font-weight: 500;
}

.trend-up { color: #16A34A; }

/* Filter Card */
.filter-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-actionable);
  box-shadow: var(--elevation-1);
  padding: 16px 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.filter-select {
  width: 200px;
}

.date-input-wrap {
  display: flex;
  align-items: center;
  background-color: #F9FAFB;
  border: 1px solid #D1D5DB;
  border-radius: var(--radius-actionable);
  padding: 0 10px;
  height: 40px;
}

.date-input {
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  font-size: 13px;
  width: 170px;
}

.btn-stock-alerts {
  color: #1F2937 !important;
  border-color: #D1D5DB !important;
}

.clear-filters-link {
  font-size: 13px;
  color: var(--color-primary-light);
  text-decoration: underline;
  cursor: pointer;
}

/* Layout */
.supervisor-content-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.master-table-card {
  flex: 1 1 65%;
  min-width: 0;
  background-color: var(--color-surface);
  border-radius: var(--radius-actionable);
  box-shadow: var(--elevation-1);
  padding: 20px;
}

.detail-side-panel {
  flex: 0 0 380px;
  width: 380px;
  background-color: var(--color-surface);
  border-radius: var(--radius-actionable);
  box-shadow: var(--elevation-2);
  padding: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
}

.total-badge {
  font-size: 12px;
}

/* Tables */
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

/* Fila activa en amarillo idéntica al mockup */
.clickable-row.row-active-yellow {
  background-color: #FEF9C3 !important;
}

/* Pills */
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

.pill-completed {
  background-color: #DCFCE7;
  color: #15803D;
}
.pill-completed .status-dot { background-color: #22C55E; }

.pill-difference {
  background-color: #FEF3C7;
  color: #B45309;
}
.pill-difference .status-dot { background-color: #F59E0B; }

.pill-pending {
  background-color: #FEE2E2;
  color: #B91C1C;
}
.pill-pending .status-dot { background-color: #EF4444; }

/* Pagination */
.btn-page-active {
  background-color: #F59E0B !important;
  color: #111827 !important;
  border: none !important;
}

.rows-select {
  width: 70px;
}

/* Detail Panel */
.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
}

.panel-id-badge {
  background-color: #F3F4F6;
  color: var(--color-primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.meta-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 14px;
  border-bottom: 1px solid #E5E7EB;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.meta-k {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.meta-v {
  color: var(--color-text-main);
  font-weight: 600;
}

/* Mini Table */
.materials-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
}

.mini-table {
  border-collapse: collapse;
  font-size: 12px;
}

.mini-table th {
  background-color: #F8FAFC;
  padding: 6px 8px;
  color: var(--color-text-secondary);
  font-weight: 600;
  border-bottom: 1px solid #E2E8F0;
}

.mini-table td {
  padding: 8px;
  border-bottom: 1px solid #F3F4F6;
}

.thumb-img {
  width: 60px;
  height: 48px;
  object-fit: cover;
  border: 1px solid #E5E7EB;
}

@media (max-width: 1024px) {
  .supervisor-content-layout {
    flex-direction: column;
  }
  .detail-side-panel {
    width: 100%;
    flex: auto;
  }
}
</style>
