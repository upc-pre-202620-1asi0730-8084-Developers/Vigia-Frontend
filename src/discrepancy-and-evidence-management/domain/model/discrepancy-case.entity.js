export class DiscrepancyCase {
    constructor({
                    id,
                    dispatchId,
                    projectName,
                    issueType,
                    status,
                    priority,
                    reportedAt,
                    description,
                    timeline
                }) {
        this.id = id
        this.dispatchId = dispatchId
        this.projectName = projectName
        this.issueType = issueType
        this.status = status
        this.priority = priority
        this.reportedAt = reportedAt
        this.description = description
        this.timeline = timeline
    }
}