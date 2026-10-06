import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const materialsEndpointPath = import.meta.env.VITE_MATERIALS_ENDPOINT_PATH || '/materials';
const movementsEndpointPath = import.meta.env.VITE_INVENTORY_MOVEMENTS_ENDPOINT_PATH || '/inventory-movements';

/**
 * Infrastructure gateway for Inventory Management bounded-context endpoints.
 *
 * @class InventoryManagementApi
 * @extends BaseApi
 */
export class InventoryManagementApi extends BaseApi {
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #materialsEndpoint;
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #movementsEndpoint;

    /** Creates endpoint clients for materials and inventory movements. */
    constructor() {
        super();
        this.#materialsEndpoint = new BaseEndpoint(this, materialsEndpointPath);
        this.#movementsEndpoint = new BaseEndpoint(this, movementsEndpointPath);
    }

    /**
     * Fetches all materials.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the materials' response.
     */
    getMaterials() {
        return this.#materialsEndpoint.getAll();
    }

    /**
     * Fetches all inventory movements.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the movements' response.
     */
    getMovements() {
        return this.#movementsEndpoint.getAll();
    }
}
