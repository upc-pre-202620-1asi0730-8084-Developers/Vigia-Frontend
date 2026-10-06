<script setup>
/**
 * Indicator card: tinted icon, label and value.
 */
defineProps({
  /** PrimeIcons class, e.g. "pi pi-building". */
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: [Number, String], required: true },
  /** Palette tone of the icon: primary | success | accent | error. */
  tone: { type: String, default: 'primary' }
});
</script>

<template>
  <div class="vigia-card kpi-card">
    <span class="kpi-icon" :class="`tone-${tone}`"><i :class="icon" aria-hidden="true" /></span>
    <div>
      <div class="kpi-label">{{ label }}</div>
      <div class="kpi-value">{{ value }}</div>
    </div>
  </div>
</template>

<style scoped>
.kpi-card {
  display: flex;
  align-items: center;
  gap: var(--sp-16);
  height: 100%;
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.tone-primary { color: var(--color-primary); background-color: color-mix(in srgb, var(--color-primary) 10%, transparent); }
.tone-error { color: var(--color-error); background-color: color-mix(in srgb, var(--color-error) 12%, transparent); }
.tone-success { color: var(--color-success); background-color: color-mix(in srgb, var(--color-success) 12%, transparent); }
.tone-accent { color: var(--color-accent); background-color: color-mix(in srgb, var(--color-accent) 15%, transparent); }

.kpi-label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-main);
}
</style>
