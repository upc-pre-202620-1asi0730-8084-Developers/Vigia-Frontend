<script setup>
import { useI18n } from 'vue-i18n';
import { PROJECT_STATUS, projectStatusSeverity } from '../../../project-management/domain/project-status.js';

/**
 * Card with the progress of a list of projects (Project Management).
 */
defineProps({
  title: { type: String, required: true },
  projects: { type: Array, required: true },
  emptyText: { type: String, default: '' }
});

const { t } = useI18n();

const PROGRESS_COLORS = {
  [PROJECT_STATUS.IN_PROGRESS]: 'var(--color-success)',
  [PROJECT_STATUS.DELAYED]: 'var(--color-accent)',
  [PROJECT_STATUS.AT_RISK]: 'var(--color-error)'
};
</script>

<template>
  <div class="vigia-card">
    <div class="card-header">
      <h2 class="m-0">{{ title }}</h2>
      <router-link to="/obras" class="see-all">{{ t('home.seeAll') }}</router-link>
    </div>
    <p v-if="!projects.length" class="subtitle m-0">{{ emptyText }}</p>
    <div v-else class="table-wrapper">
      <table class="progress-table">
        <thead>
          <tr>
            <th scope="col">{{ t('projects.table.project') }}</th>
            <th scope="col">{{ t('projects.table.progress') }}</th>
            <th scope="col">{{ t('projects.table.dispatches') }}</th>
            <th scope="col">{{ t('projects.table.receptions') }}</th>
            <th scope="col">{{ t('projects.table.status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="project in projects" :key="project.id">
            <td class="font-semibold"><i class="pi pi-building mr-2 project-icon" aria-hidden="true" />{{ project.name }}</td>
            <td>
              <div class="progress">
                <span class="progress-value">{{ project.progress }}%</span>
                <span class="progress-track">
                  <span class="progress-fill" :style="{ width: `${project.progress}%`, background: PROGRESS_COLORS[project.status] }" />
                </span>
              </div>
            </td>
            <td>{{ project.dispatchesCount }}</td>
            <td>{{ project.receptionsCount }}</td>
            <td><pv-tag :value="t(`projects.status.${project.status}`)" :severity="projectStatusSeverity(project.status)" /></td>
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

.table-wrapper {
  overflow-x: auto;
}

.progress-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.progress-table th {
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  background-color: var(--color-bg);
  padding: var(--sp-8);
}

.progress-table td {
  padding: var(--sp-8);
  border-bottom: 1px solid var(--p-content-border-color);
  white-space: nowrap;
}

.project-icon {
  color: var(--color-primary-light);
}

.progress {
  display: flex;
  align-items: center;
  gap: var(--sp-8);
  min-width: 9rem;
}

.progress-value {
  font-weight: 600;
  min-width: 2.5rem;
}

.progress-track {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background-color: var(--p-content-border-color);
  overflow: hidden;
}

.progress-fill {
  display: block;
  height: 100%;
  border-radius: 3px;
}
</style>
