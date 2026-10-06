<script setup>
  import {watch} from "vue";
  import {useI18n} from "vue-i18n";
  import {LOCALE_STORAGE_KEY} from "../../../i18n.js";

  const { locale, availableLocales, t } = useI18n();

  // Keep the document language and the saved preference in sync with the active locale.
  watch(locale, value => {
    document.documentElement.lang = value;
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, value);
    } catch {
      // Storage may be unavailable (private mode); the language still changes for this visit.
    }
  }, { immediate: true });
</script>

<template>
  <pv-select-button
      v-model="locale"
      :options="availableLocales"
      :allow-empty="false"
      :aria-label="t('nav.language')"
      class="language-switcher"
  >
    <template #option="slotProps">
      <span>{{ slotProps.option.toUpperCase() }}</span>
    </template>
  </pv-select-button>
</template>

<style scoped>
.language-switcher :deep(.p-togglebutton) {
  min-width: 2.75rem;
  font-weight: 600;
  color: var(--color-primary);
  background-color: var(--color-surface);
  border-color: var(--color-primary);
}

.language-switcher :deep(.p-togglebutton-checked),
.language-switcher :deep(.p-togglebutton-checked .p-togglebutton-content) {
  color: #FFFFFF;
  background-color: var(--color-primary);
}

.language-switcher :deep(.p-togglebutton:not(.p-togglebutton-checked):hover) {
  background-color: var(--p-primary-50);
}
</style>
