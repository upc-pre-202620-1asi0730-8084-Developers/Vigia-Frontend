<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  reception: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:visible']);

const { t } = useI18n();

const evidences = computed(() => {
  return props.reception?.evidences || [];
});

function closeDialog() {
  emit('update:visible', false);
}
</script>

<template>
  <pv-dialog
    :visible="visible"
    modal
    :header="t('receptions.evidence.galleryTitle') + (reception ? ` (${reception.id})` : '')"
    :style="{ width: '90vw', maxWidth: '720px' }"
    @update:visible="closeDialog"
  >
    <div class="gallery-content">
      <div v-if="!evidences.length" class="text-center p-4">
        <i class="pi pi-images text-4xl text-300 mb-2"></i>
        <p class="text-secondary">{{ t('receptions.evidence.noEvidence') }}</p>
      </div>

      <div v-else class="grid grid-nogutter">
        <div
          v-for="ev in evidences"
          :key="ev.id"
          class="col-12 md:col-6 p-2"
        >
          <div class="evidence-card surface-card border-1 surface-border border-round overflow-hidden">
            <div class="img-wrapper">
              <img :src="ev.evidenceUrl" :alt="ev.caption" class="w-full gallery-img" />
            </div>
            <div class="p-3">
              <p class="font-medium text-sm text-primary mb-1">{{ ev.caption }}</p>
              <div class="flex justify-content-between align-items-center text-xs text-secondary">
                <span><i class="pi pi-calendar mr-1"></i>{{ new Date(ev.capturedAt).toLocaleString() }}</span>
                <span class="tag-evidence">{{ ev.type || 'FOTO' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <pv-button :label="t('common.close')" class="btn-secondary" @click="closeDialog" />
    </template>
  </pv-dialog>
</template>

<style scoped>
.gallery-content {
  max-height: 70vh;
  overflow-y: auto;
}

.img-wrapper {
  height: 200px;
  background-color: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.gallery-img {
  max-height: 100%;
  object-fit: cover;
}

.tag-evidence {
  background-color: rgba(245, 166, 35, 0.15);
  color: #925400;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}
</style>
