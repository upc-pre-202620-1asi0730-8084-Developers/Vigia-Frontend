/**
 * Lifecycle states of a Route (Transit Traceability bounded context, BC-06).
 * A route starts IN_TRANSIT when the vehicle leaves the warehouse geofence
 * and ends ARRIVED when it enters the destination site geofence.
 */
export const ROUTE_STATUS = {
    IN_TRANSIT: 'IN_TRANSIT',
    DEVIATED: 'DEVIATED',
    STOPPED: 'STOPPED',
    SIGNAL_LOST: 'SIGNAL_LOST',
    ARRIVED: 'ARRIVED'
};

/**
 * Types of transit alerts raised while a route is being tracked.
 */
export const TRANSIT_ALERT_TYPE = {
    ROUTE_DEVIATION: 'ROUTE_DEVIATION',
    PROLONGED_STOP: 'PROLONGED_STOP',
    SIGNAL_LOST: 'SIGNAL_LOST',
    SIGNAL_RECOVERED: 'SIGNAL_RECOVERED',
    GEOFENCE_ENTRY: 'GEOFENCE_ENTRY'
};

/**
 * Alert types that must be notified to the destination site.
 */
export const NOTIFIABLE_ALERT_TYPES = [
    TRANSIT_ALERT_TYPE.ROUTE_DEVIATION,
    TRANSIT_ALERT_TYPE.PROLONGED_STOP
];

/**
 * Color severity for the pv-tag of a route status.
 * @param {string} status
 * @returns {string}
 */
export function routeStatusSeverity(status) {
    switch (status) {
        case ROUTE_STATUS.ARRIVED:
            return 'success';
        case ROUTE_STATUS.DEVIATED:
            return 'danger';
        case ROUTE_STATUS.STOPPED:
            return 'warn';
        case ROUTE_STATUS.SIGNAL_LOST:
            return 'secondary';
        case ROUTE_STATUS.IN_TRANSIT:
        default:
            return 'info';
    }
}

/**
 * Color severity for the pv-tag of a transit alert type.
 * @param {string} type
 * @returns {string}
 */
export function transitAlertSeverity(type) {
    switch (type) {
        case TRANSIT_ALERT_TYPE.ROUTE_DEVIATION:
            return 'danger';
        case TRANSIT_ALERT_TYPE.PROLONGED_STOP:
            return 'warn';
        case TRANSIT_ALERT_TYPE.GEOFENCE_ENTRY:
        case TRANSIT_ALERT_TYPE.SIGNAL_RECOVERED:
            return 'success';
        case TRANSIT_ALERT_TYPE.SIGNAL_LOST:
        default:
            return 'secondary';
    }
}
