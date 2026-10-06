<script setup>
import { useI18n } from 'vue-i18n';
import { ACTIVITY_TYPE_ICON } from '../../../activity-history/domain/activity-type.js';

/**
 * Recent activity card fed by Activity History records.
 */
defineProps({
  /** Activity records, most recent first. */
  records: { type: Array, required: true }
});

const { t, locale } = useI18n();

const formatDateTime = iso => new Date(iso).toLocaleString(locale.value, { dateStyle: 'short', timeStyle: 'short' });
</script>

<template>
  <div class="vigia-card">
    <div class="card-header">
      <h2 class="m-0">{{ t('home.activity.title') }}</h2>
      <router-link to="/historial" class="see-all">{{ t('home.seeAll') }}</router-link>
    </div>
    <p v-if="!records.length" class="subtitle m-0">{{ t('home.activity.empty') }}</p>
    <ul v-else class="feed">
      <li v-for="record in records" :key="record.id">
        <span class="feed-icon"><i :class="ACTIVITY_TYPE_ICON[record.type]" aria-hidden="true" /></span>
        <div class="feed-text">
          <span>{{ t(`history.action.${record.action}`, { detail: record.detail }) }}</span>
          <small class="subtitle">{{ record.reference }} · {{ record.userName }} · {{ formatDateTime(record.occurredAt) }}</small>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.subtitle {
  color: var(--color-text-secondary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: var(--sp-16);
}

.see-all {
  font-size: 13px;
  color: var(--color-primary-light);
}

.feed {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-16);
}

.feed li {
  display: flex;
  gap: var(--sp-16);
  align-items: flex-start;
}

.feed-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary-light) 15%, var(--color-surface));
}

.feed-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
