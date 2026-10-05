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
                description: 'Difference detected between dispatched and received cement bags.',
                timeline: [
                    {
                        id: 1,
                        stage: 'Warehouse',
                        title: 'Dispatch prepared',
                        description: 'The order was prepared and verified at the warehouse.',
                        date: '2026-10-03 08:30'
                    },
                    {
                        id: 2,
                        stage: 'Transit',
                        title: 'Vehicle departed',
                        description: 'The transport unit left the warehouse.',
                        date: '2026-10-03 09:10'
                    },
                    {
                        id: 3,
                        stage: 'Site',
                        title: 'Reception discrepancy reported',
                        description: 'A difference was detected between dispatched and received quantities.',
                        date: '2026-10-03 11:45'
                    }
                ]
            },
            {
                id: 2,
                dispatchId: 'DSP-002',
                projectName: 'Edificio San Isidro',
                issueType: 'Damaged materials',
                status: 'Under Review',
                priority: 'Medium',
                reportedAt: '2026-10-02',
                description: 'Several ceramic boxes arrived damaged.',
                timeline: [
                    {
                        id: 1,
                        stage: 'Warehouse',
                        title: 'Load verified',
                        description: 'Ceramic boxes were counted and loaded for dispatch.',
                        date: '2026-10-02 07:50'
                    },
                    {
                        id: 2,
                        stage: 'Transit',
                        title: 'Prolonged stop detected',
                        description: 'The vehicle remained stopped longer than expected during transit.',
                        date: '2026-10-02 09:25'
                    },
                    {
                        id: 3,
                        stage: 'Site',
                        title: 'Damaged materials reported',
                        description: 'Several ceramic boxes were found damaged during reception.',
                        date: '2026-10-02 11:20'
                    }
                ]
            },
            {
                id: 3,
                dispatchId: 'DSP-003',
                projectName: 'Proyecto Surco',
                issueType: 'Quantity mismatch',
                status: 'Closed',
                priority: 'Low',
                reportedAt: '2026-09-30',
                description: 'Minor quantity difference already resolved.',
                timeline: [
                    {
                        id: 1,
                        stage: 'Warehouse',
                        title: 'Dispatch registered',
                        description: 'The material quantities were registered before departure.',
                        date: '2026-09-30 08:10'
                    },
                    {
                        id: 2,
                        stage: 'Transit',
                        title: 'Route completed',
                        description: 'The vehicle completed the planned route without incidents.',
                        date: '2026-09-30 10:15'
                    },
                    {
                        id: 3,
                        stage: 'Site',
                        title: 'Quantity mismatch reported',
                        description: 'A minor difference was detected during reception.',
                        date: '2026-09-30 10:40'
                    },
                    {
                        id: 4,
                        stage: 'Resolution',
                        title: 'Case closed',
                        description: 'The discrepancy was reviewed and the case was closed.',
                        date: '2026-10-01 15:30'
                    }
                ]
            }
        ]

        return DiscrepancyCaseAssembler.toEntities(resources)
    }

    async generateSupportingReport(caseId) {
        return {
            caseId: caseId,
            fileName: `discrepancy-case-${caseId}-report.pdf`,
            generated: true
        }
    }
}