import {TelemetryPosition} from "./telemetry-position.entity.js";
import {TransitAlert} from "./transit-alert.entity.js";
import {ROUTE_STATUS, TRANSIT_ALERT_TYPE} from "../route-status.js";

/** Radius in meters within which consecutive positions count as the vehicle standing still. */
const STOP_RADIUS_METERS = 50;

/**
 * Route aggregate root (trip of a vehicle carrying a dispatch) within the
 * Transit Traceability bounded context (BC-06).
 * dispatchId references Dispatch.id (Order Management and Dispatch) and
 * vehicleId / destinationGeofenceId reference Fleet and Device Management.
 *
 * Invariants: positions are only accepted while the route is active, and each
 * deviation or prolonged stop raises a single alert until it is cleared.
 *
 * @class Route
 */
export class Route {
    /**
     * @param {Object} params - Aggregate attributes.
     * @param {?string} [params.id=null] - Route identifier (e.g. RT-001).
     * @param {?string} [params.dispatchId=null] - Tracked dispatch (e.g. DS-106).
     * @param {?number} [params.vehicleId=null] - Vehicle carrying the dispatch.
     * @param {string} [params.vehiclePlate=''] - License plate, for display.
     * @param {string} [params.originName=''] - Origin warehouse name.
     * @param {?number} [params.destinationGeofenceId=null] - Destination site geofence id.
     * @param {Object} [params.destination] - Destination site geofence snapshot.
     * @param {string} [params.destination.name='']
     * @param {number} [params.destination.latitude]
     * @param {number} [params.destination.longitude]
     * @param {number} [params.destination.radiusMeters=150]
     * @param {Array<{latitude: number, longitude: number}>} [params.plannedPath=[]] - Planned route waypoints.
     * @param {Array<TelemetryPosition|Object>} [params.positions=[]] - Accumulated telemetry.
     * @param {Array<TransitAlert|Object>} [params.alerts=[]] - Raised transit alerts.
     * @param {string} [params.status=ROUTE_STATUS.IN_TRANSIT] - Route status.
     * @param {string} [params.startedAt=''] - Departure from the origin geofence.
     * @param {string} [params.estimatedArrival=''] - Estimated arrival at the destination.
     * @param {?string} [params.arrivedAt=null] - Entry into the destination geofence.
     * @param {number} [params.deviationThresholdMeters=300] - Max distance from the planned path.
     * @param {number} [params.stopThresholdMinutes=15] - Max minutes stopped before raising an alert.
     */
    constructor({ id = null, dispatchId = null, vehicleId = null, vehiclePlate = '', originName = '',
                  destinationGeofenceId = null, destination = {}, plannedPath = [], positions = [], alerts = [],
                  status = ROUTE_STATUS.IN_TRANSIT, startedAt = '', estimatedArrival = '', arrivedAt = null,
                  deviationThresholdMeters = 300, stopThresholdMinutes = 15 }) {
        this.id = id;
        this.dispatchId = dispatchId;
        this.vehicleId = vehicleId;
        this.vehiclePlate = vehiclePlate;
        this.originName = originName;
        this.destinationGeofenceId = destinationGeofenceId;
        this.destination = {
            name: destination.name || '',
            latitude: Number(destination.latitude),
            longitude: Number(destination.longitude),
            radiusMeters: Number(destination.radiusMeters) || 150
        };
        this.plannedPath = plannedPath.map(({latitude, longitude}) => ({latitude: Number(latitude), longitude: Number(longitude)}));
        this.positions = positions.map(p => p instanceof TelemetryPosition ? p : new TelemetryPosition({...p}));
        this.alerts = alerts.map(a => a instanceof TransitAlert ? a : new TransitAlert({...a}));
        this.status = status;
        this.startedAt = startedAt;
        this.estimatedArrival = estimatedArrival;
        this.arrivedAt = arrivedAt;
        this.deviationThresholdMeters = Number(deviationThresholdMeters) || 300;
        this.stopThresholdMinutes = Number(stopThresholdMinutes) || 15;
    }

    /** @returns {boolean} Whether the route still accepts telemetry. */
    get isActive() {
        return this.status !== ROUTE_STATUS.ARRIVED;
    }

    /** @returns {?TelemetryPosition} Last reported position. */
    get currentPosition() {
        return this.positions.length ? this.positions[this.positions.length - 1] : null;
    }

    /** @returns {TransitAlert[]} Deviation / stop alerts not yet notified to the destination site. */
    get pendingNotifications() {
        return this.alerts.filter(alert => alert.isPendingNotification);
    }

    /** @returns {number} Distance travelled along the reported positions, in meters. */
    get travelledDistanceMeters() {
        return this.positions.reduce((total, position, i) => i === 0 ? 0 : total + this.positions[i - 1].distanceTo(position), 0);
    }

    /**
     * Distance from a position to the closest segment of the planned path.
     * @param {TelemetryPosition} position
     * @returns {number} Distance in meters.
     */
    distanceToPlannedPath(position) {
        if (this.plannedPath.length < 2) return 0;
        let min = Infinity;
        for (let i = 1; i < this.plannedPath.length; i++) {
            min = Math.min(min, position.distanceToSegment(this.plannedPath[i - 1], this.plannedPath[i]));
        }
        return min;
    }

    /**
     * Minutes the vehicle has stayed within STOP_RADIUS_METERS up to the position at index.
     * @param {number} index - Position index.
     * @returns {number} Minutes stopped.
     */
    minutesStoppedAt(index) {
        if (index < 1) return 0;
        const position = this.positions[index];
        let first = index;
        while (first > 0 && this.positions[first - 1].distanceTo(position) <= STOP_RADIUS_METERS) first--;
        return this.positions[first].minutesUntil(position);
    }

    /**
     * @param {TelemetryPosition} position
     * @returns {boolean} Whether the position lies inside the destination site geofence.
     */
    isInsideDestination(position) {
        return position.distanceTo(this.destination) <= this.destination.radiusMeters;
    }

    /**
     * Incorporates a position reported by the GPS telemetry platform and evaluates
     * route deviation, prolonged stop and destination geofence entry.
     * @param {Object} positionData - { latitude, longitude, speedKmh, reportedAt }.
     * @returns {TransitAlert[]} Alerts raised by this position.
     */
    registerPosition(positionData) {
        if (!this.isActive) throw new Error(`Route ${this.id} already arrived at its destination.`);

        const position = positionData instanceof TelemetryPosition ? positionData : new TelemetryPosition({...positionData});
        const previous = this.currentPosition;
        const raised = [];

        if (this.status === ROUTE_STATUS.SIGNAL_LOST) {
            raised.push(this.#raiseAlert(TRANSIT_ALERT_TYPE.SIGNAL_RECOVERED, position));
        }

        this.positions.push(position);
        const index = this.positions.length - 1;

        const distanceOffRoute = this.distanceToPlannedPath(position);
        const isOffRoute = distanceOffRoute > this.deviationThresholdMeters;
        const wasOffRoute = previous ? this.distanceToPlannedPath(previous) > this.deviationThresholdMeters : false;
        if (isOffRoute && !wasOffRoute) {
            raised.push(this.#raiseAlert(TRANSIT_ALERT_TYPE.ROUTE_DEVIATION, position, Math.round(distanceOffRoute)));
        }

        const minutesStopped = this.minutesStoppedAt(index);
        const isStopped = minutesStopped >= this.stopThresholdMinutes;
        const wasStopped = this.minutesStoppedAt(index - 1) >= this.stopThresholdMinutes;
        if (isStopped && !wasStopped) {
            raised.push(this.#raiseAlert(TRANSIT_ALERT_TYPE.PROLONGED_STOP, position, Math.round(minutesStopped)));
        }

        if (this.isInsideDestination(position)) {
            raised.push(this.#raiseAlert(TRANSIT_ALERT_TYPE.GEOFENCE_ENTRY, position));
            this.status = ROUTE_STATUS.ARRIVED;
            this.arrivedAt = position.reportedAt;
        } else {
            this.status = isOffRoute ? ROUTE_STATUS.DEVIATED : isStopped ? ROUTE_STATUS.STOPPED : ROUTE_STATUS.IN_TRANSIT;
        }
        return raised;
    }

    /**
     * Registers that the GPS device stopped reporting.
     * @param {string} [detectedAt] - ISO timestamp of the detection.
     * @returns {TransitAlert} Raised signal-lost alert.
     */
    reportSignalLost(detectedAt = new Date().toISOString()) {
        if (!this.isActive) throw new Error(`Route ${this.id} already arrived at its destination.`);
        if (this.status === ROUTE_STATUS.SIGNAL_LOST) throw new Error(`Route ${this.id} signal is already lost.`);
        const alert = this.#raiseAlert(TRANSIT_ALERT_TYPE.SIGNAL_LOST, this.currentPosition, null, detectedAt);
        this.status = ROUTE_STATUS.SIGNAL_LOST;
        return alert;
    }

    /**
     * Marks a deviation or prolonged-stop alert as notified to the destination site.
     * @param {string} alertId
     * @returns {TransitAlert} Notified alert.
     */
    notifyDestinationSite(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) throw new Error(`Alert ${alertId} not found in route ${this.id}.`);
        alert.markAsNotified();
        return alert;
    }

    /**
     * @param {string} type - TRANSIT_ALERT_TYPE.
     * @param {?TelemetryPosition} position - Where it was detected.
     * @param {?number} [value=null] - Measured value.
     * @param {string} [detectedAt] - Defaults to the position timestamp.
     * @returns {TransitAlert} Raised alert.
     */
    #raiseAlert(type, position, value = null, detectedAt = position?.reportedAt) {
        const alert = new TransitAlert({
            id: `${this.id}-AL-${this.alerts.length + 1}`,
            type,
            detectedAt,
            latitude: position?.latitude ?? null,
            longitude: position?.longitude ?? null,
            value
        });
        this.alerts.push(alert);
        return alert;
    }
}
