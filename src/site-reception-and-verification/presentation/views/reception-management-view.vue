<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useReceptionStore } from '../../application/reception.store.js';
import useIamStore from '../../../iam/application/iam.store.js';
import { ROLES } from '../../../shared/presentation/navigation.config.js';

import SiteManagerReceptionView from '../components/site-manager-reception-view.vue';
import SupervisorReceptionView from '../components/supervisor-reception-view.vue';
import EvidenceGalleryDialog from '../components/evidence-gallery-dialog.vue';

const { t } = useI18n();
const router = useRouter();
const receptionStore = useReceptionStore();
const iamStore = useIamStore();

// Modo de vista: 'site_manager' (Responsable de Obra) o 'supervisor' (Supervisor / Admin)
const currentPerspective = ref('site_manager');

// Galería de evidencias (solo lectura); registrar y reportar discrepancias se hacen en páginas propias
const isGalleryOpen = ref(false);
const targetReception = ref(null);

// Sincronizar automáticamente la perspectiva inicial según el rol activo de IAM
watch(
  () => iamStore.currentRole,
  (newRole) => {
    if (newRole === ROLES.ADMIN) {
      currentPerspective.value = 'supervisor';
    } else {
      currentPerspective.value = 'site_manager';
    }
  },
  { immediate: true }
);

onMounted(async () => {
  try {
    await Promise.all([
      receptionStore.fetchReceptions(),
      receptionStore.fetchUpcomingArrivals()
    ]);
  } catch (e) {
    console.warn('[ReceptionView] Error al inicializar recepciones:', e);
  }
});

// Títulos y subtítulos dinámicos según la perspectiva activa (§4.4.3 mockups)
const viewHeader = computed(() => {
  if (currentPerspective.value === 'supervisor') {
    return {
      title: t('receptions.supervisor.title'),
      subtitle: t('receptions.supervisor.subtitle')
    };
  }
  return {
    title: t('receptions.siteManager.title'),
    subtitle: t('receptions.siteManager.subtitle')
  };
});

/**
 * Opens the register reception page, preloading an upcoming arrival or an existing reception.
 * @param {?Object} source - Upcoming arrival or reception selected in the list.
 */
function goToRegister(source = null) {
  const query = !source ? {} : source.arrivedAt ? { reception: source.id } : { arrival: source.id || source.dispatchId };
  router.push({ name: 'reception-new', query });
}

/** @param {Object} reception - Reception whose discrepancy is reported. */
function goToDiscrepancy(reception) {
  router.push({ name: 'reception-discrepancy', params: { id: reception.id } });
}

function openGalleryDialog(reception) {
  targetReception.value = reception;
  isGalleryOpen.value = true;
}

async function handleConfirmReception(reception) {
  try {
    await receptionStore.verifyReception(reception.id, {
      status: reception.hasDiscrepancy ? 'VERIFIED_DISCREPANT' : 'VERIFIED_CONFORMANT',
      closedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error al confirmar recepción:', err);
  }
}
</script>

<template>
  <div class="reception-management-view">
    <!-- Header General con selector de perspectiva y botón de acción -->
    <div class="header-container mb-4">
      <div class="header-text">
        <h1 class="main-title m-0">{{ viewHeader.title }}</h1>
        <p class="main-subtitle m-0">{{ viewHeader.subtitle }}</p>
      </div>

      <div class="header-actions-row flex align-items-center gap-3">
        <!-- Switch interactivo de perspectivas (Responsable de Obra vs Supervisor) -->
        <div class="perspective-switcher flex align-items-center p-1 border-round surface-border border-1">
          <button
            type="button"
            class="perspective-btn"
            :class="{ active: currentPerspective === 'site_manager' }"
            @click="currentPerspective = 'site_manager'"
          >
            <i class="pi pi-user mr-1"></i>
            {{ t('receptions.perspective.siteManager') }}
          </button>
          <button
            type="button"
            class="perspective-btn"
            :class="{ active: currentPerspective === 'supervisor' }"
            @click="currentPerspective = 'supervisor'"
          >
            <i class="pi pi-shield mr-1"></i>
            {{ t('receptions.perspective.supervisor') }}
          </button>
        </div>

        <!-- Indicador de fecha del mockup -->
        <div class="date-badge">
          <i class="pi pi-calendar mr-2 text-secondary"></i>
          <span>Mon, April 14, 2025</span>
        </div>

        <!-- Botón de Registrar Recepción (§4.4.3 Mockup 4receptions.png) -->
        <pv-button
          :label="t('receptions.actions.registerReception')"
          icon="pi pi-plus"
          class="btn-accent"
          @click="goToRegister(null)"
        />
      </div>
    </div>

    <!-- Indicador de carga -->
    <div v-if="receptionStore.loading && !receptionStore.receptions.length" class="text-center p-6">
      <i class="pi pi-spin pi-spinner text-4xl text-primary mb-2"></i>
      <p class="text-secondary">{{ t('common.loading') }}</p>
    </div>

    <!-- Vista 1: Responsable de Obra (Mockup 4receptions.png) -->
    <div v-else-if="currentPerspective === 'site_manager'">
      <SiteManagerReceptionView
        @reportIssue="goToDiscrepancy"
        @editReception="goToRegister"
        @viewGallery="openGalleryDialog"
        @registerArrival="goToRegister"
      />
    </div>

    <!-- Vista 2: Supervisor (Mockup Modern Receptions Dashboard with Stock Alerts.png) -->
    <div v-else-if="currentPerspective === 'supervisor'">
      <SupervisorReceptionView
        @reportDiscrepancy="goToDiscrepancy"
        @confirmReception="handleConfirmReception"
        @viewGallery="openGalleryDialog"
      />
    </div>

    <!-- Galería de evidencias (solo lectura) -->
    <EvidenceGalleryDialog
      v-model:visible="isGalleryOpen"
      :reception="targetReception"
    />
  </div>
</template>

<style scoped>
.reception-management-view {
  width: 100%;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.main-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
}

.main-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.date-badge {
  display: inline-flex;
  align-items: center;
  background-color: var(--color-surface);
  border: 1px solid #E5E7EB;
  border-radius: var(--radius-actionable);
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-main);
  box-shadow: var(--elevation-1);
}

.perspective-switcher {
  background-color: #F1F5F9;
  border-radius: 8px;
}

.perspective-btn {
  background: transparent;
  border: none;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--transition-default);
  display: flex;
  align-items: center;
}

.perspective-btn.active {
  background-color: var(--color-surface);
  color: var(--color-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (max-width: 960px) {
  .header-container {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-actions-row {
    flex-wrap: wrap;
    width: 100%;
  }
}
</style>
