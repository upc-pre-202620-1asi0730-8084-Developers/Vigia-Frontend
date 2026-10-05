import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DiscrepancyApi } from '../infrastructure/discrepancy-api.js'

export const useDiscrepancyStore = defineStore('discrepancy', () => {
    const cases = ref([])
    const loading = ref(false)
    const error = ref(null)

    const discrepancyApi = new DiscrepancyApi()

    const loadCases = async () => {
        loading.value = true
        error.value = null

        try {
            cases.value = await discrepancyApi.getAllCases()
        } catch (err) {
            error.value = err
        } finally {
            loading.value = false
        }
    }
    const generateSupportingReport = async (caseId) => {
        try {
            return await discrepancyApi.generateSupportingReport(caseId)
        } catch (err) {
            error.value = err
            return null
        }
    }
    const determineResponsibility = async (caseId, responsibility) => {
        try {
            const result = await discrepancyApi.determineResponsibility(
                caseId,
                responsibility
            )

            const discrepancyCase = cases.value.find(
                item => item.id === caseId
            )

            if (discrepancyCase && result.updated) {
                discrepancyCase.responsibility = result.responsibility
            }

            return result
        } catch (err) {
            error.value = err
            return null
        }
    }

    const closeCase = async (caseId) => {
        const discrepancyCase = cases.value.find(
            item => item.id === caseId
        )

        if (!discrepancyCase || !discrepancyCase.responsibility) {
            return {
                closed: false,
                message: 'Responsibility must be determined before closing the case.'
            }
        }

        try {
            const result = await discrepancyApi.closeCase(caseId)

            if (result.closed) {
                discrepancyCase.status = result.status
            }

            return result
        } catch (err) {
            error.value = err
            return null
        }
    }

    return {
        cases,
        loading,
        error,
        loadCases,
        generateSupportingReport,
        determineResponsibility,
        closeCase
    }
})