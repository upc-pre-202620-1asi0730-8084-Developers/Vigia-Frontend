/**
 * Status of a construction project (Project Management bounded context).
 */
export const PROJECT_STATUS = {
    IN_PROGRESS: 'IN_PROGRESS',
    DELAYED: 'DELAYED',
    AT_RISK: 'AT_RISK'
};

/**
 * Geographic zones used to group projects.
 */
export const PROJECT_ZONE = {
    LIMA: 'LIMA',
    NORTH: 'NORTH',
    SOUTH: 'SOUTH',
    CENTER: 'CENTER',
    EAST: 'EAST'
};

/**
 * Color severity for the pv-tag of a project status.
 * @param {string} status
 * @returns {string}
 */
export function projectStatusSeverity(status) {
    switch (status) {
        case PROJECT_STATUS.AT_RISK:
            return 'danger';
        case PROJECT_STATUS.DELAYED:
            return 'warn';
        case PROJECT_STATUS.IN_PROGRESS:
        default:
            return 'success';
    }
}
