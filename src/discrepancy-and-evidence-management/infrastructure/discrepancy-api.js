import { DiscrepancyCaseAssembler } from './discrepancy-case.assembler.js'

export class DiscrepancyApi {
    async getAllCases() {
        const resources = [
            {
                id: 1,
                dispatchId: 'DSP-001',
                projectName: 'Residencial Miraflores',
                issueType: 'Missing materials',
                status: 'Open',
                priority: 'High',
                reportedAt: '2026-10-03',
                description: 'Difference detected between dispatched and received cement bags.'
            },
            {
                id: 2,
                dispatchId: 'DSP-002',
                projectName: 'Edificio San Isidro',
                issueType: 'Damaged materials',
                status: 'Under Review',
                priority: 'Medium',
                reportedAt: '2026-10-02',
                description: 'Several ceramic boxes arrived damaged.'
            },
            {
                id: 3,
                dispatchId: 'DSP-003',
                projectName: 'Proyecto Surco',
                issueType: 'Quantity mismatch',
                status: 'Closed',
                priority: 'Low',
                reportedAt: '2026-09-30',
                description: 'Minor quantity difference already resolved.'
            }
        ]

        return DiscrepancyCaseAssembler.toEntities(resources)
    }
}