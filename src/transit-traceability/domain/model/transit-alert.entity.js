import {NOTIFIABLE_ALERT_TYPES} from "../route-status.js";

/**
 * Transit alert entity raised by a Route while it is tracked
 * (route deviation, prolonged stop, signal lost/recovered, geofence entry).
 *
 * @class TransitAlert
 */
export class TransitAlert {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Alert identifier.
     * @param {string} params.type - Alert type (TRANSIT_ALERT_TYPE).
     * @param {string} [params.detectedAt=''] - ISO timestamp of the detection.
     * @param {?number} [params.latitude=null] - Latitude where the alert was detected.
     * @param {?number} [params.longitude=null] - Longitude where the alert was detected.
     * @param {?number} [params.value=null] - Measured value (meters off route or minutes stopped).
     * @param {?string} [params.notifiedAt=null] - ISO timestamp when the destination site was notified.
     */
    constructor({ id = null, type, detectedAt = '', latitude = null, longitude = null, value = null, notifiedAt = null }) {
        this.id = id;
        this.type = type;
        this.detectedAt = detectedAt || new Date().toISOString();
        this.latitude = latitude;
        this.longitude = longitude;
        this.value = value;
        this.notifiedAt = notifiedAt;
    }

    /** @returns {boolean} Whether this alert type must be notified to the destination site. */
    get requiresNotification() {
        return NOTIFIABLE_ALERT_TYPES.includes(this.type);
    }

    /** @returns {boolean} Whether the alert still has to be notified to the destination site. */
    get isPendingNotification() {
        return this.requiresNotification && !this.notifiedAt;
    }

    /**
     * Marks the alert as notified to the destination site.
     * @param {string} [notifiedAt] - ISO timestamp of the notification.
     */
    markAsNotified(notifiedAt = new Date().toISOString()) {
        if (!this.requiresNotification) throw new Error(`Alert type ${this.type} is not notifiable.`);
        this.notifiedAt = notifiedAt;
    }
}
