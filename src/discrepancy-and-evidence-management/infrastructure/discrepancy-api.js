import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'
import { DiscrepancyCaseAssembler } from './discrepancy-case.assembler.js'

const discrepancyCasesEndpointPath = import.meta.env.VITE_DISCREPANCY_CASES_ENDPOINT_PATH || '/discrepancy-cases'

export class DiscrepancyApi extends BaseApi {
    #casesEndpoint

    constructor() {
        super()
        this.#casesEndpoint = new BaseEndpoint(this, discrepancyCasesEndpointPath)
    }

    async getAllCases() {
        const response = await this.#casesEndpoint.getAll()

        return DiscrepancyCaseAssembler.toEntities(response.data)
    }

    async generateSupportingReport(caseId) {
        return {
            caseId: caseId,
            fileName: `discrepancy-case-${caseId}-report.pdf`,
            generated: true
        }
    }

    async determineResponsibility(caseId, responsibility) {
        const response = await this.http.patch(`${discrepancyCasesEndpointPath}/${caseId}`, { responsibility })

        return {
            caseId: caseId,
            responsibility: response.data.responsibility,
            updated: true
        }
    }

    async closeCase(caseId) {
        const response = await this.http.patch(`${discrepancyCasesEndpointPath}/${caseId}`, { status: 'Closed' })

        return {
            caseId: caseId,
            status: response.data.status,
            closed: true
        }
    }
}
