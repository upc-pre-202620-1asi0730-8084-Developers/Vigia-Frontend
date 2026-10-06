<script setup>
import { computed } from 'vue';

/**
 * Donut chart drawn with a CSS conic-gradient, with a legend of counts and percentages.
 */
const props = defineProps({
  /** Segments to draw: { key, label, value, color } (color as a CSS value, e.g. a palette token). */
  segments: { type: Array, required: true },
  /** Caption shown under the total in the center of the donut. */
  centerLabel: { type: String, default: '' }
});

const total = computed(() => props.segments.reduce((sum, segment) => sum + segment.value, 0));

const percentage = value => total.value ? Math.round((value / total.value) * 100) : 0;

const gradient = computed(() => {
  if (!total.value) return 'var(--p-content-border-color)';
  let start = 0;
  const stops = props.segments.map(segment => {
    const end = start + (segment.value / total.value) * 360;
    const stop = `${segment.color} ${start}deg ${end}deg`;
    start = end;
    return stop;
  });
  return `conic-gradient(${stops.join(', ')})`;
});
</script>

<template>
  <div class="donut-chart">
    <div class="donut" :style="{ background: gradient }" role="img" :aria-label="`${total} ${centerLabel}`">
      <div class="donut-hole">
        <span class="donut-total">{{ total }}</span>
        <small class="donut-caption">{{ centerLabel }}</small>
      </div>
    </div>
    <ul class="donut-legend">
      <li v-for="segment in segments" :key="segment.key">
        <span class="legend-dot" :style="{ background: segment.color }" aria-hidden="true" />
        <span class="legend-label">{{ segment.label }}</span>
        <span class="legend-value">{{ segment.value }} ({{ percentage(segment.value) }}%)</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.donut-chart {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-24);
}

.donut {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.donut-hole {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background-color: var(--color-surface);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.donut-total {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-main);
  line-height: 1;
}

.donut-caption {
  color: var(--color-text-secondary);
}

.donut-legend {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  gap: var(--sp-8);
}

.donut-legend li {
  display: flex;
  align-items: center;
  gap: var(--sp-8);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  flex: 1;
  color: var(--color-text-main);
}

.legend-value {
  font-weight: 600;
  color: var(--color-text-main);
}
</style>
