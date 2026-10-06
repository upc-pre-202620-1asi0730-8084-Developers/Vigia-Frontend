import {Dispatch} from "../domain/model/dispatch.entity.js";

/**
 * Maps dispatch resources into domain entities.
 *
 * @class DispatchAssembler
 */
export class DispatchAssembler {
    /**
     * @param {Object} resource - Dispatch resource payload.
     * @returns {Dispatch} Dispatch entity.
     */
    static toEntityFromResource(resource) {
        return new Dispatch({...resource})
    }

    /**
     * Parses dispatch resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with dispatch resources.
     * @returns {Dispatch[]} Dispatch entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['dispatches'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
