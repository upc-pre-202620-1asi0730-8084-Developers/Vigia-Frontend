import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const activityRecordsEndpointPath = import.meta.env.VITE_ACTIVITY_RECORDS_ENDPOINT_PATH || '/activity-records';

/**
 * Infrastructure gateway for Activity History bounded-context endpoints.
 *
 * @class ActivityHistoryApi
 * @extends BaseApi
 */
export class ActivityHistoryApi extends BaseApi {
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #activityRecordsEndpoint;

    /** Creates the endpoint client for activity records. */
    constructor() {
        super();
        this.#activityRecordsEndpoint = new BaseEndpoint(this, activityRecordsEndpointPath);
    }

    /**
     * Fetches all activity records.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the activity records' response.
     */
    getActivityRecords() {
        return this.#activityRecordsEndpoint.getAll();
    }
}
