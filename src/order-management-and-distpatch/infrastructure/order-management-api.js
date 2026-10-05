import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const ordersEndpointPath = import.meta.env.VITE_ORDERS_ENDPOINT_PATH || '/orders';
const dispatchesEndpointPath = import.meta.env.VITE_DISPATCHES_ENDPOINT_PATH || '/dispatches';

/**
 * Cliente de infraestructura del Bounded Context BC-05 Ordering and Dispatch.
 * Expone operaciones CRUD sobre las colecciones de Orders y Dispatches (json-server).
 *
 * @class OrderManagementApi
 * @extends BaseApi
 */
export class OrderManagementApi extends BaseApi {
    #ordersEndpoint;
    #dispatchesEndpoint;

    constructor() {
        super();
        this.#ordersEndpoint = new BaseEndpoint(this, ordersEndpointPath);
        this.#dispatchesEndpoint = new BaseEndpoint(this, dispatchesEndpointPath);
    }

    // ----- Orders -----
    getOrders() {
        return this.#ordersEndpoint.getAll();
    }

    getOrderById(id) {
        return this.#ordersEndpoint.getById(id);
    }

    createOrder(resource) {
        return this.#ordersEndpoint.create(resource);
    }

    updateOrder(id, resource) {
        return this.#ordersEndpoint.update(id, resource);
    }

    // ----- Dispatches -----
    getDispatches() {
        return this.#dispatchesEndpoint.getAll();
    }

    getDispatchById(id) {
        return this.#dispatchesEndpoint.getById(id);
    }

    createDispatch(resource) {
        return this.#dispatchesEndpoint.create(resource);
    }

    updateDispatch(id, resource) {
        return this.#dispatchesEndpoint.update(id, resource);
    }
}
