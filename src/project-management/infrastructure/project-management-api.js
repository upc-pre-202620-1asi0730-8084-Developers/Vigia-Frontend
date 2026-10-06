import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const projectsEndpointPath = import.meta.env.VITE_PROJECTS_ENDPOINT_PATH || '/projects';

/**
 * Infrastructure gateway for Project Management bounded-context endpoints.
 *
 * @class ProjectManagementApi
 * @extends BaseApi
 */
export class ProjectManagementApi extends BaseApi {
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #projectsEndpoint;

    /** Creates the endpoint client for projects. */
    constructor() {
        super();
        this.#projectsEndpoint = new BaseEndpoint(this, projectsEndpointPath);
    }

    /**
     * Fetches all projects.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the projects' response.
     */
    getProjects() {
        return this.#projectsEndpoint.getAll();
    }
}
