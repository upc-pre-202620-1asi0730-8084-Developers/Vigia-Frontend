import {ACTIVITY_STATUS, ACTIVITY_TYPE} from "../activity-type.js";

/**
 * Activity record entity (an event of the material traceability flow) within the
 * Activity History bounded context. Its reference points to the record of the
 * bounded context where the event happened (dispatch, route, reception or case).
 *
 * @class ActivityRecord
 */
export class ActivityRecord {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Record identifier (e.g. ACT-001).
     * @param {string} [params.occurredAt=''] - ISO timestamp of the event.
     * @param {string} [params.type=ACTIVITY_TYPE.DISPATCH] - Activity type (ACTIVITY_TYPE).
     * @param {string} [params.action=''] - Event code, translated in the view (e.g. DISPATCH_CREATED).
     * @param {string} [params.detail=''] - Extra detail for the description (e.g. destination).
     * @param {string} [params.userName=''] - User who performed the action.
     * @param {string} [params.reference=''] - Referenced record id (e.g. DS-104, RT-001, RC-104).
     * @param {string} [params.status=ACTIVITY_STATUS.COMPLETED] - Status (ACTIVITY_STATUS).
     */
    constructor({ id = null, occurredAt = '', type = ACTIVITY_TYPE.DISPATCH, action = '', detail = '',
                  userName = '', reference = '', status = ACTIVITY_STATUS.COMPLETED }) {
        this.id = id;
        this.occurredAt = occurredAt;
        this.type = type;
        this.action = action;
        this.detail = detail;
        this.userName = userName;
        this.reference = reference;
        this.status = status;
    }

    /** @returns {string} Local calendar date of the event (YYYY-MM-DD), for date range filters. */
    get localDate() {
        const date = new Date(this.occurredAt);
        const pad = n => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }
}
