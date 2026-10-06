<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue'
import { useDiscrepancyStore } from '../../application/discrepancy.store.js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const discrepancyStore = useDiscrepancyStore()
const selectedResponsibility = ref('')
const brokenImages = reactive({})

const RESPONSIBILITIES = ['Warehouse', 'Transport', 'Site']
const responsibilityOptions = computed(() => RESPONSIBILITIES.map(value => ({
  label: t(`issues.responsibility.${value.toLowerCase()}`),
  value
})))

const notify = (severity, summary) => toast.add({ severity, summary, life: 3500 })

const generateReport = async () => {
  const result = await discrepancyStore.generateSupportingReport(
      discrepancyCase.value.id
  )

  if (result) {
    notify('success', t('issues.report.generated', { fileName: result.fileName }))
  }
}

onMounted(() => {
  if (discrepancyStore.cases.length === 0) {
    discrepancyStore.loadCases()
  }
})

const saveResponsibility = async () => {
  if (!selectedResponsibility.value) {
    notify('warn', t('issues.responsibility.required'))
    return
  }

  const result = await discrepancyStore.determineResponsibility(
      discrepancyCase.value.id,
      selectedResponsibility.value
  )

  if (result) {
    notify('success', t('issues.responsibility.updated'))
  }
}

const discrepancyCase = computed(() => {
  return discrepancyStore.cases.find(
      item => item.id === Number(route.params.id)
  )
})

const isClosed = computed(() => discrepancyCase.value?.status === 'Closed')

const closeDiscrepancyCase = async () => {
  const result = await discrepancyStore.closeCase(
      discrepancyCase.value.id
  )

  if (!result) {
    return
  }

  notify(
      result.closed ? 'success' : 'warn',
      result.closed
          ? t('issues.closure.success')
          : t('issues.closure.responsibilityRequired')
  )
}

const statusSeverity = (status) => {
  if (status === 'Open') return 'danger'
  if (status === 'Under Review') return 'warn'
  return 'success'
}

const prioritySeverity = (priority) => {
  if (priority === 'High') return 'danger'
  if (priority === 'Medium') return 'warn'
  return 'secondary'
}

const STAGE_ICONS = {
  Warehouse: 'pi pi-box',
  Transit: 'pi pi-truck',
  Site: 'pi pi-building',
  Resolution: 'pi pi-check-circle'
}

const withoutPeriod = text => text.replace(/\.$/, '')
</script>

<template>
  <section class="p-4">
    <pv-button :label="t('issues.title')" icon="pi pi-arrow-left" link class="back-link mb-2" @click="router.push('/problemas')" />
    <h1 class="mt-0">{{ t('issues.detailTitle') }}</h1>

    <div v-if="discrepancyStore.loading" class="subtitle">
      {{ t('issues.loadingDetail') }}
    </div>

    <div v-else-if="discrepancyCase" class="grid">
      <div class="col-12 xl:col-8">
        <div class="vigia-card mb-3">
          <div class="case-header">
            <div>
              <span class="case-id">{{ discrepancyCase.dispatchId }}</span>
              <span class="subtitle"> · {{ discrepancyCase.projectName }}</span>
            </div>
            <div class="flex gap-2">
              <pv-tag :value="t(`issues.values.status.${discrepancyCase.status}`)" :severity="statusSeverity(discrepancyCase.status)" />
              <pv-tag :value="t(`issues.values.priority.${discrepancyCase.priority}`)" :severity="prioritySeverity(discrepancyCase.priority)" />
            </div>
          </div>
          <div class="facts">
            <div><small>{{ t('issues.fields.dispatch') }}</small><span>{{ discrepancyCase.dispatchId }}</span></div>
            <div><small>{{ t('issues.fields.project') }}</small><span>{{ discrepancyCase.projectName }}</span></div>
            <div><small>{{ t('issues.fields.type') }}</small><span>{{ t(`issues.values.type.${discrepancyCase.issueType}`) }}</span></div>
            <div><small>{{ t('issues.fields.reported') }}</small><span>{{ discrepancyCase.reportedAt }}</span></div>
          </div>
          <div class="description">
            <small>{{ t('issues.fields.description') }}</small>
            <p class="m-0">{{ t(`issues.content.caseDescription.${withoutPeriod(discrepancyCase.description)}`) }}</p>
          </div>
        </div>

        <div class="vigia-card mb-3">
          <h2 class="mt-0">{{ t('issues.timeline.title') }}</h2>
          <pv-timeline :value="discrepancyCase.timeline" class="case-timeline">
            <template #marker="{ item }">
              <span class="timeline-marker"><i :class="STAGE_ICONS[item.stage] || 'pi pi-circle'" aria-hidden="true" /></span>
            </template>
            <template #opposite="{ item }">
              <small class="subtitle">{{ item.date }}</small>
            </template>
            <template #content="{ item }">
              <div class="timeline-event">
                <span class="stage">{{ t(`issues.values.stage.${item.stage}`) }}</span>
                <strong>{{ t(`issues.content.timelineTitle.${item.title}`) }}</strong>
                <p class="m-0 subtitle">{{ t(`issues.content.timelineDescription.${withoutPeriod(item.description)}`) }}</p>
              </div>
            </template>
          </pv-timeline>
        </div>

        <div class="vigia-card">
          <h2 class="mt-0">{{ t('issues.photographicEvidence.title') }}</h2>
          <div v-if="discrepancyCase.evidences.length > 0" class="evidence-grid">
            <figure v-for="evidence in discrepancyCase.evidences" :key="evidence.id" class="evidence">
              <img
                  v-if="!brokenImages[evidence.id]"
                  :src="evidence.evidenceUrl"
                  :alt="t(`issues.content.evidenceCaption.${withoutPeriod(evidence.caption)}`)"
                  @error="brokenImages[evidence.id] = true"
              >
              <div v-else class="evidence-placeholder" role="img"
                   :aria-label="t(`issues.content.evidenceCaption.${withoutPeriod(evidence.caption)}`)">
                <i class="pi pi-image" aria-hidden="true" />
              </div>
              <figcaption>
                <strong>{{ t(`issues.content.evidenceType.${evidence.type}`) }}</strong>
                <span>{{ t(`issues.content.evidenceCaption.${withoutPeriod(evidence.caption)}`) }}</span>
                <small class="subtitle">{{ evidence.capturedAt }}</small>
              </figcaption>
            </figure>
          </div>
          <p v-else class="subtitle m-0">{{ t('issues.photographicEvidence.none') }}</p>
        </div>
      </div>

      <div class="col-12 xl:col-4">
        <div class="vigia-card mb-3">
          <h2 class="mt-0">{{ t('issues.missingEvidence.title') }}</h2>
          <ul v-if="discrepancyCase.missingEvidence.length > 0" class="missing-list">
            <li v-for="evidence in discrepancyCase.missingEvidence" :key="evidence">
              <i class="pi pi-exclamation-circle" aria-hidden="true" />
              {{ t(`issues.content.missingEvidence.${evidence}`) }}
            </li>
          </ul>
          <p v-else class="subtitle m-0"><i class="pi pi-check mr-1" aria-hidden="true" />{{ t('issues.missingEvidence.none') }}</p>
        </div>

        <div class="vigia-card mb-3">
          <h2 class="mt-0">{{ t('issues.responsibility.title') }}</h2>
          <p v-if="discrepancyCase.responsibility" class="current-responsibility">
            <small class="subtitle">{{ t('issues.responsibility.current') }}</small>
            <strong>{{ t(`issues.responsibility.${discrepancyCase.responsibility.toLowerCase()}`) }}</strong>
          </p>
          <template v-if="!isClosed">
            <pv-select v-model="selectedResponsibility" :options="responsibilityOptions" option-label="label" option-value="value"
                       :placeholder="t('issues.responsibility.select')" :aria-label="t('issues.responsibility.select')" class="w-full mb-2" />
            <pv-button :label="t('issues.responsibility.save')" icon="pi pi-check" class="btn-primary w-full" @click="saveResponsibility" />
          </template>
        </div>

        <div class="vigia-card actions">
          <pv-button :label="t('issues.report.generate')" icon="pi pi-file-pdf" class="btn-secondary w-full" @click="generateReport" />
          <pv-button v-if="!isClosed" :label="t('issues.closure.button')" icon="pi pi-lock" class="btn-accent w-full" @click="closeDiscrepancyCase" />
        </div>
      </div>
    </div>

    <div v-else class="subtitle">
      {{ discrepancyStore.error ? t('issues.loadError') : t('issues.notFound') }}
    </div>
  </section>
</template>

<style scoped>
.subtitle {
  color: var(--color-text-secondary);
}

.back-link {
  padding-left: 0;
}

.case-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: var(--sp-8);
  margin-bottom: var(--sp-16);
}

.case-id {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: var(--sp-16);
  padding: var(--sp-16) 0;
  border-top: 1px solid var(--p-content-border-color);
  border-bottom: 1px solid var(--p-content-border-color);
}

.facts div,
.description {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.facts small,
.description small {
  color: var(--color-text-secondary);
}

.facts span {
  font-weight: 600;
  color: var(--color-text-main);
}

.description {
  margin-top: var(--sp-16);
}

.timeline-marker {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary-light) 15%, var(--color-surface));
}

.timeline-event {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  padding-bottom: var(--sp-16);
}

.stage {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-primary-light);
}

:deep(.case-timeline .p-timeline-event-opposite) {
  flex: 0 0 8rem;
}

.evidence-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: var(--sp-16);
}

.evidence {
  margin: 0;
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--radius-actionable);
  overflow: hidden;
}

.evidence img,
.evidence-placeholder {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.evidence-placeholder {
  display: grid;
  place-items: center;
  font-size: 2rem;
  color: var(--color-text-secondary);
  background-color: var(--color-bg);
}

.evidence figcaption {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  padding: var(--sp-8) var(--sp-16) var(--sp-16);
}

.missing-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-8);
}

.missing-list .pi {
  color: var(--color-error);
  margin-right: var(--sp-8);
}

.current-responsibility {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  margin: 0 0 var(--sp-16);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: var(--sp-8);
}
</style>
