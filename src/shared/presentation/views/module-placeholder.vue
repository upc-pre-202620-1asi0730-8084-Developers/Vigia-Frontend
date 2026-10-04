<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useIamStore from '../../../iam/application/iam.store.js';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const iamStore = useIamStore();

const moduleTitle = computed(() => {
  return route.meta?.title || route.name;
});
</script>

<template>
  <div class="module-placeholder">
    <pv-card>
      <template #title>
        <div class="card-header-row">
          <i class="pi pi-compass placeholder-icon mr-2" aria-hidden="true"></i>
          <span>{{ t('modules.placeholderTitle', { name: moduleTitle }) }}</span>
        </div>
      </template>
      <template #content>
        <p class="placeholder-desc">
          {{ t('modules.placeholderDesc', { role: t(`roles.${iamStore.currentRole}`) }) }}
        </p>
        <div class="mt-4">
          <pv-button
            :label="t('nav.transport') + ' (BC-04)'"
            icon="pi pi-truck"
            class="btn-accent"
            @click="router.push('/transporte')"
          />
        </div>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.module-placeholder {
  max-width: 800px;
  margin: 0 auto;
}

.card-header-row {
  display: flex;
  align-items: center;
  color: var(--color-primary);
}

.placeholder-icon {
  font-size: 24px;
  color: var(--color-primary-light);
}

.placeholder-desc {
  color: var(--color-text-secondary);
  line-height: 1.6;
}
</style>
