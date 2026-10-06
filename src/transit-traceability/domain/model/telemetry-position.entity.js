const EARTH_RADIUS_METERS = 6371000;
const toRadians = degrees => (degrees * Math.PI) / 180;

/**
 * Value object for a GPS position reported by the telemetry platform
 * within the Transit Traceability bounded context.
 *
 * @class TelemetryPosition
 */
export class TelemetryPosition {
    /**
     * @param {Object} params - Value object attributes.
     * @param {number} params.latitude - Latitude in decimal degrees (-90 to 90).
     * @param {number} params.longitude - Longitude in decimal degrees (-180 to 180).
     * @param {number} [params.speedKmh=0] - Reported speed in km/h.
     * @param {string} [params.reportedAt=''] - ISO timestamp of the report.
     */
    constructor({ latitude, longitude, speedKmh = 0, reportedAt = '' }) {
        const lat = Number(latitude);
        const lon = Number(longitude);
        if (isNaN(lat) || lat < -90 || lat > 90) throw new Error(`Invalid latitude: ${latitude}`);
        if (isNaN(lon) || lon < -180 || lon > 180) throw new Error(`Invalid longitude: ${longitude}`);

        this.latitude = lat;
        this.longitude = lon;
        this.speedKmh = Number(speedKmh) || 0;
        this.reportedAt = reportedAt || new Date().toISOString();
        Object.freeze(this);
    }

    /**
     * Haversine distance to another coordinate.
     * @param {{latitude: number, longitude: number}} other - Target coordinate.
     * @returns {number} Distance in meters.
     */
    distanceTo(other) {
        const dLat = toRadians(other.latitude - this.latitude);
        const dLon = toRadians(other.longitude - this.longitude);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRadians(this.latitude)) * Math.cos(toRadians(other.latitude)) * Math.sin(dLon / 2) ** 2;
        return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    /**
     * Shortest distance to a path segment, using a local equirectangular projection
     * (accurate enough for the few kilometers between two route waypoints).
     * @param {{latitude: number, longitude: number}} start - Segment start.
     * @param {{latitude: number, longitude: number}} end - Segment end.
     * @returns {number} Distance in meters.
     */
    distanceToSegment(start, end) {
        const metersPerDegreeLat = EARTH_RADIUS_METERS * Math.PI / 180;
        const metersPerDegreeLon = metersPerDegreeLat * Math.cos(toRadians(this.latitude));
        const project = point => ({
            x: (point.longitude - this.longitude) * metersPerDegreeLon,
            y: (point.latitude - this.latitude) * metersPerDegreeLat
        });
        const a = project(start);
        const b = project(end);
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const lengthSquared = dx * dx + dy * dy;
        const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, -(a.x * dx + a.y * dy) / lengthSquared));
        return Math.hypot(a.x + t * dx, a.y + t * dy);
    }

    /**
     * Minutes elapsed between this position and a later one.
     * @param {TelemetryPosition} later - Later position.
     * @returns {number} Elapsed minutes.
     */
    minutesUntil(later) {
        return (new Date(later.reportedAt) - new Date(this.reportedAt)) / 60000;
    }
}
