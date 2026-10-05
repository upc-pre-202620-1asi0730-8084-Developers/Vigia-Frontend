import { DiscrepancyCase } from '../domain/model/discrepancy-case.entity.js'

export class DiscrepancyCaseAssembler {
    static toEntity(resource) {
        return new DiscrepancyCase({
            id: resource.id,
            dispatchId: resource.dispatchId,
            projectName: resource.projectName,
            issueType: resource.issueType,
            status: resource.status,
            priority: resource.priority,
            reportedAt: resource.reportedAt,
            description: resource.description,
            timeline: resource.timeline,
            responsibility: resource.responsibility
        })
    }

    static toEntities(resources) {
        return resources.map(resource => this.toEntity(resource))
    }
}