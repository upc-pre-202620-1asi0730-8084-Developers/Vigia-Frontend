import {TelemetryPosition} from "../domain/model/telemetry-position.entity.js";

/** Distance advanced along the planned path on each simulated report, in meters. */
const STEP_METERS = 2500;
/** Minutes between two simulated reports. */
const REPORT_INTERVAL_MINUTES = 5;
/** Lateral offset applied when simulating a route deviation, in meters. */
const DEVIATION_OFFSET_METERS = 800;
const METERS_PER_DEGREE = 111320;

export const SIMULATION_MODE = {
    ON_ROUTE: 'ON_ROUTE',
    DEVIATION: 'DEVIATION',
    STOP: 'STOP'
};

/**
 * Stand-in for the external GPS telemetry platform while no real device is connected.
 * Generates the next position report of a route along its planned path.
 *
 * @class TelemetrySimulator
 */
export class TelemetrySimulator {
    /**
     * @param {import('../domain/model/route.entity.js').Route} route - Tracked route.
     * @param {string} [mode=SIMULATION_MODE.ON_ROUTE] - Kind of report to generate.
     * @returns {{latitude: number, longitude: number, speedKmh: number, reportedAt: string}} Position report.
     */
    static nextReport(route, mode = SIMULATION_MODE.ON_ROUTE) {
        const last = route.currentPosition;
        const reportedAt = this.nextTimestamp(route);

        if (mode === SIMULATION_MODE.STOP && last) {
            return {latitude: last.latitude, longitude: last.longitude, speedKmh: 0, reportedAt};
        }

        const point = this.#pointAlongPath(route.plannedPath, this.#progressOnPath(route.plannedPath, last) + STEP_METERS);
        const speedKmh = Math.round(STEP_METERS / 1000 / (REPORT_INTERVAL_MINUTES / 60));

        if (mode === SIMULATION_MODE.DEVIATION) {
            return {latitude: point.latitude + DEVIATION_OFFSET_METERS / METERS_PER_DEGREE, longitude: point.longitude, speedKmh, reportedAt};
        }
        return {...point, speedKmh, reportedAt};
    }

    /**
     * Timestamp of the next simulated platform event, one report interval after the latest
     * position or alert of the route, so simulated events keep a consistent timeline.
     * @param {import('../domain/model/route.entity.js').Route} route - Tracked route.
     * @returns {string} ISO timestamp.
     */
    static nextTimestamp(route) {
        const times = [
            ...route.positions.map(p => new Date(p.reportedAt).getTime()),
            ...route.alerts.map(a => new Date(a.detectedAt).getTime())
        ];
        const latest = times.length ? Math.max(...times) : Date.now();
        return new Date(latest + REPORT_INTERVAL_MINUTES * 60000).toISOString();
    }

    /**
     * Distance along the path up to the projection of a position (0 when there is no position yet).
     * @param {Array<{latitude: number, longitude: number}>} path
     * @param {?TelemetryPosition} position
     * @returns {number} Meters from the path start.
     */
    static #progressOnPath(path, position) {
        if (!position || path.length < 2) return 0;
        let best = {distance: Infinity, progress: 0};
        let travelled = 0;
        for (let i = 1; i < path.length; i++) {
            const start = new TelemetryPosition(path[i - 1]);
            const length = start.distanceTo(path[i]);
            const distance = position.distanceToSegment(path[i - 1], path[i]);
            if (distance < best.distance) {
                const ratio = length === 0 ? 0 : Math.min(1, start.distanceTo(position) / length);
                best = {distance, progress: travelled + ratio * length};
            }
            travelled += length;
        }
        return best.progress;
    }

    /**
     * Point located at a distance along the path (the last waypoint when beyond its end).
     * @param {Array<{latitude: number, longitude: number}>} path
     * @param {number} meters - Distance from the path start.
     * @returns {{latitude: number, longitude: number}}
     */
    static #pointAlongPath(path, meters) {
        let remaining = meters;
        for (let i = 1; i < path.length; i++) {
            const length = new TelemetryPosition(path[i - 1]).distanceTo(path[i]);
            if (remaining <= length) {
                const ratio = length === 0 ? 0 : remaining / length;
                return {
                    latitude: path[i - 1].latitude + (path[i].latitude - path[i - 1].latitude) * ratio,
                    longitude: path[i - 1].longitude + (path[i].longitude - path[i - 1].longitude) * ratio
                };
            }
            remaining -= length;
        }
        return {...path[path.length - 1]};
    }
}
