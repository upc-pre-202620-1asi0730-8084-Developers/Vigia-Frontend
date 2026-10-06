/**
 * Estados del ciclo de vida de un Despacho (BC Order Management and Dispatch).
 * El orden refleja el avance del seguimiento mostrado en el detalle del despacho.
 */
export const DISPATCH_STATUS = {
    IN_PREPARATION: 'IN_PREPARATION',
    SCHEDULED: 'SCHEDULED',
    IN_TRANSIT: 'IN_TRANSIT',
    NEAR_SITE: 'NEAR_SITE',
    DELIVERED: 'DELIVERED',
    WITH_INCIDENT: 'WITH_INCIDENT'
};

/**
 * Etapas del seguimiento (stepper) del detalle de despacho.
 */
export const DISPATCH_TRACKING_STEPS = [
    DISPATCH_STATUS.IN_PREPARATION,
    DISPATCH_STATUS.IN_TRANSIT,
    DISPATCH_STATUS.NEAR_SITE,
    DISPATCH_STATUS.DELIVERED
];

export const DISPATCH_PRIORITY = {
    HIGH: 'HIGH',
    AVERAGE: 'AVERAGE',
    LOW: 'LOW'
};

export const DISPATCH_TYPE = {
    DEPARTURE_TO_WORK: 'DEPARTURE_TO_WORK',
    TRANSFER: 'TRANSFER',
    RETURN: 'RETURN'
};

/**
 * Severidad de color para el pv-tag del estado del despacho.
 * @param {string} status
 * @returns {string}
 */
export function dispatchStatusSeverity(status) {
    switch (status) {
        case DISPATCH_STATUS.IN_TRANSIT:
        case DISPATCH_STATUS.NEAR_SITE:
            return 'info';
        case DISPATCH_STATUS.DELIVERED:
            return 'success';
        case DISPATCH_STATUS.WITH_INCIDENT:
            return 'danger';
        case DISPATCH_STATUS.SCHEDULED:
            return 'secondary';
        case DISPATCH_STATUS.IN_PREPARATION:
        default:
            return 'warn';
    }
}

export function dispatchPrioritySeverity(priority) {
    switch (priority) {
        case DISPATCH_PRIORITY.HIGH:
            return 'danger';
        case DISPATCH_PRIORITY.LOW:
            return 'secondary';
        case DISPATCH_PRIORITY.AVERAGE:
        default:
            return 'warn';
    }
}
