/**
 * Kinds of activity recorded in the history (Activity History bounded context).
 */
export const ACTIVITY_TYPE = {
    DISPATCH: 'DISPATCH',
    TRANSPORT: 'TRANSPORT',
    RECEPTION: 'RECEPTION',
    DISCREPANCY: 'DISCREPANCY'
};

/**
 * Status of the referenced record when the activity was recorded.
 */
export const ACTIVITY_STATUS = {
    COMPLETED: 'COMPLETED',
    IN_TRANSIT: 'IN_TRANSIT',
    PENDING: 'PENDING',
    WITH_DISCREPANCY: 'WITH_DISCREPANCY',
    CLOSED: 'CLOSED'
};

/** PrimeIcons class for each activity type. */
export const ACTIVITY_TYPE_ICON = {
    [ACTIVITY_TYPE.DISPATCH]: 'pi pi-send',
    [ACTIVITY_TYPE.TRANSPORT]: 'pi pi-truck',
    [ACTIVITY_TYPE.RECEPTION]: 'pi pi-inbox',
    [ACTIVITY_TYPE.DISCREPANCY]: 'pi pi-exclamation-triangle'
};

/**
 * Color severity for the pv-tag of an activity status.
 * @param {string} status
 * @returns {string}
 */
export function activityStatusSeverity(status) {
    switch (status) {
        case ACTIVITY_STATUS.COMPLETED:
            return 'success';
        case ACTIVITY_STATUS.IN_TRANSIT:
            return 'info';
        case ACTIVITY_STATUS.WITH_DISCREPANCY:
            return 'danger';
        case ACTIVITY_STATUS.CLOSED:
            return 'secondary';
        case ACTIVITY_STATUS.PENDING:
        default:
            return 'warn';
    }
}
