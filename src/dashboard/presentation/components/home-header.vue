<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import useIamStore from '../../../iam/application/iam.store.js';

/**
 * Home header: greeting with the active user, role subtitle and today's date.
 */
const { t, locale } = useI18n();
const iamStore = useIamStore();

const today = computed(() => {
  const text = new Date().toLocaleDateString(locale.value, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  return text.charAt(0).toUpperCase() + text.slice(1);
});
</script>

<template>
  <div class="home-header">
    <div>
      <h1 class="m-0">{{ t('home.greeting', { name: iamStore.currentUsername }) }}</h1>
      <p class="subtitle m-0 mt-1">
        <span class="role">{{ t(`roles.${iamStore.currentRole}`) }}</span> · {{ t(`home.subtitle.${iamStore.currentRole}`) }}
      </p>
    </div>
    <span class="date-chip"><i class="pi pi-calendar" aria-hidden="true" />{{ today }}</span>
  </div>
</template>

<style scoped>
.home-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--sp-16);
  margin-bottom: var(--sp-24);
}

.subtitle {
  color: var(--color-text-secondary);
}

.role {
  font-weight: 600;
  color: var(--color-primary-light);
}

.date-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-8);
  padding: var(--sp-8) var(--sp-16);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--radius-actionable);
  background-color: var(--color-surface);
  font-weight: 500;
}

.date-chip .pi {
  color: var(--color-primary);
}
</style>
