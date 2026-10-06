import {ActivityRecord} from "../domain/model/activity-record.entity.js";

/**
 * Maps activity record resources into domain entities.
 *
 * @class ActivityRecordAssembler
 */
export class ActivityRecordAssembler {
    /**
     * @param {Object} resource - Activity record resource payload.
     * @returns {ActivityRecord} Activity record entity.
     */
    static toEntityFromResource(resource) {
        return new ActivityRecord({...resource});
    }

    /**
     * Parses activity record resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with activity records.
     * @returns {ActivityRecord[]} Activity record entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['activityRecords'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
