/**
 * Estados posibles de una Order (Solicitud de materiales) — BC-05 Ordering and Dispatch.
 */
export const ORDER_STATUS = {
    PENDING: 'PENDING',
    UNDER_REVIEW: 'UNDER_REVIEW',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
};

/**
 * Prioridades de una Order.
 */
export const ORDER_PRIORITY = {
    HIGH: 'HIGH',
    AVERAGE: 'AVERAGE',
    LOW: 'LOW'
};

/**
 * Severidad de color para el pv-tag de PrimeVue según el estado.
 * @param {string} status
 * @returns {string}
 */
export function orderStatusSeverity(status) {
    switch (status) {
        case ORDER_STATUS.APPROVED:
            return 'success';
        case ORDER_STATUS.UNDER_REVIEW:
            return 'info';
        case ORDER_STATUS.REJECTED:
            return 'danger';
        case ORDER_STATUS.PENDING:
        default:
            return 'warn';
    }
}

/**
 * Severidad de color para el pv-tag según la prioridad.
 * @param {string} priority
 * @returns {string}
 */
export function orderPrioritySeverity(priority) {
    switch (priority) {
        case ORDER_PRIORITY.HIGH:
            return 'danger';
        case ORDER_PRIORITY.LOW:
            return 'secondary';
        case ORDER_PRIORITY.AVERAGE:
        default:
            return 'warn';
    }
}
