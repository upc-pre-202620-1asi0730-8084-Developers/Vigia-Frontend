<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useDiscrepancyStore } from '../../application/discrepancy.store.js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const discrepancyStore = useDiscrepancyStore()
const selectedResponsibility = ref('')

const generateReport = async () => {
  const result = await discrepancyStore.generateSupportingReport(
      discrepancyCase.value.id
  )

  if (result) {
    alert(t('issues.report.generated', { fileName: result.fileName }))
  }
}

onMounted(() => {
  if (discrepancyStore.cases.length === 0) {
    discrepancyStore.loadCases()
  }
})

const saveResponsibility = async () => {
  if (!selectedResponsibility.value) {
    alert(t('issues.responsibility.required'))
    return
  }

  await discrepancyStore.determineResponsibility(
      discrepancyCase.value.id,
      selectedResponsibility.value
  )

  alert(t('issues.responsibility.updated'))
}

const discrepancyCase = computed(() => {
  return discrepancyStore.cases.find(
      item => item.id === Number(route.params.id)
  )
})

const closeDiscrepancyCase = async () => {
  const result = await discrepancyStore.closeCase(
      discrepancyCase.value.id
  )

  if (!result) {
    return
  }

  alert(
      result.closed
          ? t('issues.closure.success')
          : t('issues.closure.responsibilityRequired')
  )
}


</script>

<template>
  <section>
    <h1>{{ t('issues.detailTitle') }}</h1>

    <div v-if="discrepancyStore.loading">
      {{ t('issues.loadingDetail') }}
    </div>

    <div v-else-if="discrepancyCase">
      <p><strong>{{ t('issues.fields.dispatch') }}:</strong> {{ discrepancyCase.dispatchId }}</p>
      <p><strong>{{ t('issues.fields.project') }}:</strong> {{ discrepancyCase.projectName }}</p>
      <p><strong>{{ t('issues.fields.type') }}:</strong> {{ t(`issues.values.type.${discrepancyCase.issueType}`) }}</p>
      <p><strong>{{ t('issues.fields.status') }}:</strong> {{ t(`issues.values.status.${discrepancyCase.status}`) }}</p>
      <p><strong>{{ t('issues.fields.priority') }}:</strong> {{ t(`issues.values.priority.${discrepancyCase.priority}`) }}</p>
      <p><strong>{{ t('issues.fields.reported') }}:</strong> {{ discrepancyCase.reportedAt }}</p>
      <p><strong>{{ t('issues.fields.description') }}:</strong>{{ t(`issues.content.caseDescription.${discrepancyCase.description.replace(/\.$/, '')}`) }}</p>
      <h2>{{ t('issues.timeline.title') }}</h2>

      <div
          v-for="event in discrepancyCase.timeline"
          :key="event.id"
      >
        <p><strong>{{ t(`issues.values.stage.${event.stage}`) }}</strong></p>
        <p>{{ t(`issues.content.timelineTitle.${event.title}`) }}</p>
        <p>{{ t(`issues.content.timelineDescription.${event.description.replace(/\.$/, '')}`) }}</p>
        <p>{{ event.date }}</p>
        <hr>
      </div>
      <h2>{{ t('issues.missingEvidence.title') }}</h2>

      <div v-if="discrepancyCase.missingEvidence.length > 0">
        <ul>
          <li
              v-for="evidence in discrepancyCase.missingEvidence"
              :key="evidence"
          >
            {{ t(`issues.content.missingEvidence.${evidence}`) }}
          </li>
        </ul>
      </div>

      <p v-else>
        {{ t('issues.missingEvidence.none') }}
      </p>
      <h2>{{ t('issues.photographicEvidence.title') }}</h2>

      <div v-if="discrepancyCase.evidences.length > 0">
        <div
            v-for="evidence in discrepancyCase.evidences"
            :key="evidence.id"
        >
          <p><strong>{{ t(`issues.content.evidenceType.${evidence.type}`) }}</strong></p>
          <p>{{ t(`issues.content.evidenceCaption.${evidence.caption.replace(/\.$/, '')}`) }}</p>
          <p>{{ evidence.capturedAt }}</p>

          <img
              :src="evidence.evidenceUrl"
              :alt="t(`issues.content.evidenceCaption.${evidence.caption.replace(/\.$/, '')}`)"
              width="250"
          >
        </div>
      </div>

      <p v-else>
        {{ t('issues.photographicEvidence.none') }}
      </p>

      <button @click="generateReport">
        {{ t('issues.report.generate') }}
      </button>
      <h2>{{ t('issues.responsibility.title') }}</h2>

      <select v-model="selectedResponsibility">
        <option value="">{{ t('issues.responsibility.select') }}</option>
        <option value="Warehouse">{{ t('issues.responsibility.warehouse') }}</option>
        <option value="Transport">{{ t('issues.responsibility.transport') }}</option>
        <option value="Site">{{ t('issues.responsibility.site') }}</option>
      </select>

      <button @click="saveResponsibility">
        {{ t('issues.responsibility.save') }}
      </button>

      <p v-if="discrepancyCase.responsibility">
        <strong>{{ t('issues.responsibility.current') }}:</strong>
        {{ t(`issues.responsibility.${discrepancyCase.responsibility.toLowerCase()}`) }}
      </p>
      <button @click="closeDiscrepancyCase">
        {{ t('issues.closure.button') }}
      </button>


    </div>

    <div v-else>
      {{ t('issues.notFound') }}
    </div>
  </section>
</template>