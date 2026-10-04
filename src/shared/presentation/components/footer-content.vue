<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <footer class="vigia-footer">
    <div class="footer-container">
      <p class="m-0 text-sm font-medium">Copyright &copy; 2026. Vigía &bull; Trazza Labs</p>
      <p class="m-0 text-xs text-secondary">
        {{ t('brand.tagline') }}
      </p>
    </div>
  </footer>
</template>

<style scoped>
.vigia-footer {
  width: 100%;
  padding: var(--sp-16) var(--sp-24);
  background-color: var(--color-surface);
  border-top: 1px solid #E0E0E0;
  margin-top: auto;
}

.footer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-4);
  text-align: center;
  color: var(--color-text-secondary);
}
</style>