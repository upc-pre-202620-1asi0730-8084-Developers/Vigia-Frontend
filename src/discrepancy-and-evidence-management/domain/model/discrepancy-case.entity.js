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
                    timeline,
                    responsibility,
                    missingEvidence,
                    evidences
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
        this.responsibility = responsibility
        this.missingEvidence = missingEvidence
        this.evidences = evidences
    }
}