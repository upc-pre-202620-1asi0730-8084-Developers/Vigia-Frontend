<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue';
import { useReceptionStore } from '../../application/reception.store.js';

/**
 * Page to report a discrepancy with photographic evidence for a reception (US-10).
 * Route: /recepciones/:id/discrepancia
 */
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const receptionStore = useReceptionStore();

const reception = computed(() => receptionStore.receptions.find(r => String(r.id) === String(route.params.id)) ?? null);

const isSubmitting = ref(false);
const errorMessage = ref('');

const discrepancyTypes = [
  { label: 'Faltante de volumen / peso (Shortage)', value: 'SHORTAGE' },
  { label: 'Material dañado / rotura física', value: 'DAMAGED_MATERIAL' },
  { label: 'Material fuera de especificación técnica', value: 'OUT_OF_SPEC' },
  { label: 'Retraso crítico / guía no coincide', value: 'DOCUMENT_MISMATCH' }
];

const samplePhotos = [
  {
    label: 'Faltante en tolva / camión',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Bolsas de cemento rotas',
    url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Tarima con faltante evidente',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80'
  }
];

const form = reactive({
  discrepancyType: 'SHORTAGE',
  observations: '',
  evidenceUrl: samplePhotos[0].url,
  caption: 'Faltante detectado durante la descarga en frente de obra.',
  selectedPreset: 0
});

onMounted(async () => {
  try {
    if (!receptionStore.receptions.length) await receptionStore.fetchReceptions();
  } catch (err) {
    errorMessage.value = err.message || t('receptions.discrepancy.errorSaving');
  }
  form.observations = reception.value?.observations || 'Diferencia constatada en obra al momento del pesaje y cubicaje.';
});

function onSelectPreset(index) {
  form.selectedPreset = index;
  form.evidenceUrl = samplePhotos[index].url;
  form.caption = `${samplePhotos[index].label} en ${reception.value?.siteName || 'obra'}.`;
}

async function onSubmit() {
  if (!form.observations || !form.caption) {
    errorMessage.value = t('receptions.discrepancy.fieldsRequired');
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const evidence = {
      evidenceUrl: form.evidenceUrl,
      caption: form.caption,
      type: 'PHOTO',
      capturedAt: new Date().toISOString()
    };

    await receptionStore.reportDiscrepancy(reception.value.id, {
      observations: `[${form.discrepancyType}] ${form.observations}`,
      evidence: evidence
    });

    toast.add({ severity: 'success', summary: t('receptions.discrepancy.reported'), detail: reception.value.id, life: 3000 });
    goBack();
  } catch (err) {
    errorMessage.value = err.message || t('receptions.discrepancy.errorSaving');
  } finally {
    isSubmitting.value = false;
  }
}

function goBack() {
  router.push('/recepciones');
}
</script>

<template>
  <div class="p-4">
    <div class="page-header">
      <pv-button :label="t('nav.receptions')" icon="pi pi-arrow-left" link class="back-link" @click="goBack" />
      <h1 class="m-0">{{ t('receptions.discrepancy.title') + (reception ? ` (${reception.id})` : '') }}</h1>
    </div>
    <div class="vigia-card discrepancy-dialog-content">
      <div v-if="errorMessage" class="error-banner mb-3">
        <i class="pi pi-exclamation-triangle mr-2"></i>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Resumen del despacho afectado -->
      <div v-if="reception" class="reception-summary-box mb-3">
        <div class="flex justify-content-between align-items-center">
          <div>
            <span class="font-bold text-primary">{{ reception.id }}</span>
            <span class="text-secondary ml-2">{{ reception.siteName }} · {{ reception.origin }}</span>
          </div>
          <span class="text-xs bg-red-100 text-red-700 px-2 py-1 border-round font-medium">
            {{ reception.totalDifference > 0 ? `-${reception.totalDifference} ${reception.items?.[0]?.unit || 't'}` : 'Sin conformidad' }}
          </span>
        </div>
      </div>

      <!-- Tipo de discrepancia -->
      <div class="mb-3">
        <label class="field-label">{{ t('receptions.discrepancy.typeLabel') }}</label>
        <pv-select
          v-model="form.discrepancyType"
          :options="discrepancyTypes"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />
      </div>

      <!-- Detalle / Observaciones -->
      <div class="mb-3">
        <label class="field-label">{{ t('receptions.discrepancy.observationsLabel') }} *</label>
        <pv-textarea
          v-model="form.observations"
          rows="3"
          class="w-full"
          :placeholder="t('receptions.discrepancy.observationsPlaceholder')"
        />
      </div>

      <!-- Registro de evidencia fotográfica (US-10) -->
      <div class="evidence-box p-3 border-round border-1 surface-border mb-3">
        <div class="flex align-items-center mb-2">
          <i class="pi pi-camera text-primary mr-2"></i>
          <span class="font-semibold text-sm">{{ t('receptions.discrepancy.evidenceTitle') }}</span>
        </div>
        <p class="caption mb-3">{{ t('receptions.discrepancy.evidenceSubtitle') }}</p>

        <!-- Presets rápidos de fotos de construcción -->
        <label class="field-label">{{ t('receptions.discrepancy.samplePhotos') }}</label>
        <div class="flex gap-2 mb-3">
          <pv-button
            v-for="(photo, idx) in samplePhotos"
            :key="idx"
            :label="photo.label"
            class="p-button-sm"
            :class="form.selectedPreset === idx ? 'btn-primary' : 'btn-secondary'"
            @click="onSelectPreset(idx)"
          />
        </div>

        <!-- Preview de la foto -->
        <div class="photo-preview-container mb-3 flex justify-content-center">
          <img :src="form.evidenceUrl" alt="Evidencia en obra" class="evidence-img border-round" />
        </div>

        <!-- URL personalizada de evidencia -->
        <div class="mb-2">
          <label class="field-label">{{ t('receptions.discrepancy.photoUrl') }}</label>
          <pv-input-text v-model="form.evidenceUrl" class="w-full" placeholder="https://..." />
        </div>

        <!-- Leyenda o anotación de la foto -->
        <div>
          <label class="field-label">{{ t('receptions.discrepancy.captionLabel') }} *</label>
          <pv-input-text v-model="form.caption" class="w-full" placeholder="Ej. Tarima con sacos faltantes en obra" />
        </div>
      </div>

      <div class="form-footer">
        <pv-button
          :label="t('common.cancel')"
          class="btn-secondary"
          @click="goBack"
          :disabled="isSubmitting"
        />
        <pv-button
          :label="t('receptions.discrepancy.submitAction')"
          icon="pi pi-exclamation-triangle"
          class="btn-accent"
          @click="onSubmit"
          :loading="isSubmitting"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: var(--sp-16);
}

.back-link {
  padding-left: 0;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--sp-8);
  margin-top: var(--sp-16);
  padding-top: var(--sp-16);
  border-top: 1px solid var(--p-content-border-color);
}

.discrepancy-dialog-content {
  max-width: 48rem;
}

.error-banner {
  background-color: #FDE8E8;
  color: var(--color-error);
  padding: var(--sp-8) var(--sp-16);
  border-radius: var(--radius-actionable);
  display: flex;
  align-items: center;
  font-size: 13px;
}

.reception-summary-box {
  background-color: #F8FAFC;
  padding: 10px 14px;
  border-radius: var(--radius-actionable);
  border: 1px solid #E2E8F0;
}

.field-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: var(--sp-4);
}

.evidence-box {
  background-color: #F9FAFB;
}

.photo-preview-container {
  background-color: #1F2937;
  padding: 8px;
  border-radius: var(--radius-actionable);
}

.evidence-img {
  max-height: 180px;
  max-width: 100%;
  object-fit: cover;
}
</style>
