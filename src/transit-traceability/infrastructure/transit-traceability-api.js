import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const routesEndpointPath = import.meta.env.VITE_ROUTES_ENDPOINT_PATH || '/routes';

/**
 * Infrastructure gateway for Transit Traceability bounded-context endpoints.
 *
 * @class TransitTraceabilityApi
 * @extends BaseApi
 */
export class TransitTraceabilityApi extends BaseApi {
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #routesEndpoint;

    /** Creates the endpoint client for routes. */
    constructor() {
        super();
        this.#routesEndpoint = new BaseEndpoint(this, routesEndpointPath);
    }

    /**
     * Fetches all routes.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the routes' response.
     */
    getRoutes() {
        return this.#routesEndpoint.getAll();
    }

    /**
     * Fetches a route by its ID.
     * @param {number|string} id - The ID of the route.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the route response.
     */
    getRouteById(id) {
        return this.#routesEndpoint.getById(id);
    }

    /**
     * Updates a route resource (accumulated telemetry, alerts and status).
     * @param {Object} resource - Route resource payload (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated route response.
     */
    updateRoute(resource) {
        return this.#routesEndpoint.update(resource.id, resource);
    }
}
