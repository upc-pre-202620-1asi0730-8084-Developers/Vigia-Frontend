import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const ordersEndpointPath     = import.meta.env.VITE_ORDERS_ENDPOINT_PATH;
const dispatchesEndpointPath = import.meta.env.VITE_DISPATCHES_ENDPOINT_PATH;

/**
 * Infrastructure gateway for Order Management and Dispatch bounded-context endpoints.
 *
 * @class OrderManagementApi
 * @extends BaseApi
 */
export class OrderManagementApi extends BaseApi {
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #ordersEndpoint;
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #dispatchesEndpoint;

    /** Creates endpoint clients for orders and dispatches. */
    constructor() {
        super();
        this.#ordersEndpoint = new BaseEndpoint(this, ordersEndpointPath);
        this.#dispatchesEndpoint = new BaseEndpoint(this, dispatchesEndpointPath);
    }

    /**
     * Fetches all orders.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the orders' response.
     */
    getOrders() {
        return this.#ordersEndpoint.getAll();
    }

    /**
     * Fetches a order by its ID.
     * @param {number|string} id - The ID of the order.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the order response.
     */
    getOrderById(id) {
        return this.#ordersEndpoint.getById(id);
    }

    /**
     * Creates a order resource.
     * @param {Object} resource - Order resource payload.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created order response.
     */
    createOrder(resource) {
        return this.#ordersEndpoint.create(resource);
    }

    /**
     * Updates a order resource.
     * @param {Object} resource - Order resource payload (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated order response.
     */
    updateOrder(resource) {
        return this.#ordersEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a order by its ID.
     * @param {number|string} id - The ID of the order to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteOrder(id) {
        return this.#ordersEndpoint.delete(id);
    }

    /**
     * Fetches all dispatches.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the dispatches' response.
     */
    getDispatches() {
        return this.#dispatchesEndpoint.getAll();
    }

    /**
     * Fetches a dispatch by its ID.
     * @param {number|string} id - The ID of the dispatch.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the dispatch response.
     */
    getDispatchById(id) {
        return this.#dispatchesEndpoint.getById(id);
    }

    /**
     * Creates a dispatch resource.
     * @param {Object} resource - Dispatch resource payload.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created dispatch response.
     */
    createDispatch(resource) {
        return this.#dispatchesEndpoint.create(resource);
    }

    /**
     * Updates a dispatch resource.
     * @param {Object} resource - Dispatch resource payload (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated dispatch response.
     */
    updateDispatch(resource) {
        return this.#dispatchesEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a dispatch by its ID.
     * @param {number|string} id - The ID of the dispatch to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteDispatch(id) {
        return this.#dispatchesEndpoint.delete(id);
    }
}
