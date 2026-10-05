import {Order} from "../domain/model/order.entity.js";

/**
 * Maps order resources into domain entities.
 *
 * @class OrderAssembler
 */
export class OrderAssembler {
    /**
     * @param {Object} resource - Order resource payload.
     * @returns {Order} Order entity.
     */
    static toEntityFromResource(resource) {
        return new Order({...resource})
    }

    /**
     * Parses order resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with order resources.
     * @returns {Order[]} Order entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['orders'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
