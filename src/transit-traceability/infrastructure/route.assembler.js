import {Route} from "../domain/model/route.entity.js";

/**
 * Maps route resources into domain entities and back.
 *
 * @class RouteAssembler
 */
export class RouteAssembler {
    /**
     * @param {Object} resource - Route resource payload.
     * @returns {Route} Route entity.
     */
    static toEntityFromResource(resource) {
        return new Route({...resource});
    }

    /**
     * Parses route resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with route resources.
     * @returns {Route[]} Route entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['routes'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {Route} entity - Route entity.
     * @returns {Object} Route resource payload.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            dispatchId: entity.dispatchId,
            vehicleId: entity.vehicleId,
            vehiclePlate: entity.vehiclePlate,
            originName: entity.originName,
            destinationGeofenceId: entity.destinationGeofenceId,
            destination: {...entity.destination},
            plannedPath: entity.plannedPath.map(point => ({...point})),
            positions: entity.positions.map(({latitude, longitude, speedKmh, reportedAt}) => ({latitude, longitude, speedKmh, reportedAt})),
            alerts: entity.alerts.map(({id, type, detectedAt, latitude, longitude, value, notifiedAt}) =>
                ({id, type, detectedAt, latitude, longitude, value, notifiedAt})),
            status: entity.status,
            startedAt: entity.startedAt,
            estimatedArrival: entity.estimatedArrival,
            arrivedAt: entity.arrivedAt,
            deviationThresholdMeters: entity.deviationThresholdMeters,
            stopThresholdMinutes: entity.stopThresholdMinutes
        };
    }
}
