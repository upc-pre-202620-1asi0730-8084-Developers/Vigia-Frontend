<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * "Needs my attention" card: items that require an action, highest priority first.
 * Item shape: { key, icon, tone (error|accent|primary), description, reference, site, priority (HIGH|MEDIUM|LOW), to }.
 */
const props = defineProps({
  items: { type: Array, required: true },
  limit: { type: Number, default: 6 }
});

const { t } = useI18n();

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };
const PRIORITY_SEVERITY = { HIGH: 'danger', MEDIUM: 'warn', LOW: 'info' };

const sortedItems = computed(() => [...props.items]
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    .slice(0, props.limit));
</script>

<template>
  <div class="vigia-card">
    <h2 class="mt-0 mb-3">{{ t('home.attention.title') }}</h2>
    <p v-if="!sortedItems.length" class="subtitle m-0">{{ t('home.attention.empty') }}</p>
    <div v-else class="table-wrapper">
      <table class="attention-table">
        <thead>
          <tr>
            <th scope="col"><span class="sr-only">{{ t('home.attention.type') }}</span></th>
            <th scope="col">{{ t('home.attention.description') }}</th>
            <th scope="col">{{ t('home.attention.reference') }}</th>
            <th scope="col">{{ t('home.attention.site') }}</th>
            <th scope="col">{{ t('home.attention.priority') }}</th>
            <th scope="col"><span class="sr-only">{{ t('home.seeAll') }}</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in sortedItems" :key="item.key">
            <td><i :class="[item.icon, `tone-${item.tone}`]" aria-hidden="true" /></td>
            <td>{{ item.description }}</td>
            <td class="font-semibold">{{ item.reference }}</td>
            <td>{{ item.site }}</td>
            <td><pv-tag :value="t(`home.priority.${item.priority}`)" :severity="PRIORITY_SEVERITY[item.priority]" /></td>
            <td>
              <router-link v-if="item.to" :to="item.to" class="row-link" :aria-label="`${item.description} ${item.reference}`">
                <i class="pi pi-chevron-right" aria-hidden="true" />
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.subtitle {
  color: var(--color-text-secondary);
}

.table-wrapper {
  overflow-x: auto;
}

.attention-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.attention-table th {
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  background-color: var(--color-bg);
  padding: var(--sp-8);
}

.attention-table td {
  padding: var(--sp-8);
  border-bottom: 1px solid var(--p-content-border-color);
  white-space: nowrap;
}

.attention-table td:nth-child(2) {
  white-space: normal;
}

.tone-error { color: var(--color-error); }
.tone-accent { color: var(--color-accent); }
.tone-primary { color: var(--color-primary-light); }

.row-link {
  color: var(--color-text-secondary);
}

.row-link:hover {
  color: var(--color-primary);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
