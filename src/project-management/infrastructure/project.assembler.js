import {Project} from "../domain/model/project.entity.js";

/**
 * Maps project resources into domain entities.
 *
 * @class ProjectAssembler
 */
export class ProjectAssembler {
    /**
     * @param {Object} resource - Project resource payload.
     * @returns {Project} Project entity.
     */
    static toEntityFromResource(resource) {
        return new Project({...resource});
    }

    /**
     * Parses project resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with project resources.
     * @returns {Project[]} Project entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['projects'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
