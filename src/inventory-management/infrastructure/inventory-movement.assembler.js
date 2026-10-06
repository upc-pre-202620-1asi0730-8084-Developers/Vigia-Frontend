import {InventoryMovement} from "../domain/model/inventory-movement.entity.js";

/**
 * Maps inventory movement resources into domain entities.
 *
 * @class InventoryMovementAssembler
 */
export class InventoryMovementAssembler {
    /**
     * @param {Object} resource - Inventory movement resource payload.
     * @returns {InventoryMovement} Inventory movement entity.
     */
    static toEntityFromResource(resource) {
        return new InventoryMovement({...resource});
    }

    /**
     * Parses inventory movement resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with movement resources.
     * @returns {InventoryMovement[]} Inventory movement entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['inventoryMovements'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
