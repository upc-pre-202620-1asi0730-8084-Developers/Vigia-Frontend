import { Geofence } from '../domain/geofence.entity.js';
import { Location } from '../domain/location.js';

/**
 * Assembler para transformar entre recursos HTTP de geocercas y entidades del dominio.
 *
 * @class GeofenceAssembler
 */
export class GeofenceAssembler {
    /**
     * Convierte un recurso JSON en entidad Geofence.
     * @param {Object} resource
     * @returns {Geofence}
     */
    static toEntityFromResource(resource) {
        if (!resource) return null;
        const center = resource.centerPoint || {};
        return new Geofence({
            id: resource.id,
            companyId: resource.companyId,
            siteId: resource.siteId,
            name: resource.name,
            type: resource.type,
            centerPoint: new Location({
                latitude: center.latitude,
                longitude: center.longitude
            }),
            radiusMeters: resource.radiusMeters
        });
    }

    /**
     * Convierte la respuesta HTTP en un arreglo de entidades Geofence.
     * @param {import('axios').AxiosResponse} response
     * @returns {Geofence[]}
     */
    static toEntitiesFromResponse(response) {
        if (!response || !response.data) return [];
        const resources = Array.isArray(response.data) ? response.data : (response.data.geofences || []);
        return resources.map(r => this.toEntityFromResource(r));
    }

    /**
     * Mapea los datos del formulario a recurso HTTP para creación de geocerca.
     * @param {Object} payload
     * @returns {Object}
     */
    static toResourceFromEntity(payload) {
        return {
            companyId: payload.companyId,
            siteId: payload.siteId,
            name: payload.name,
            type: payload.type,
            centerPoint: {
                latitude: Number(payload.centerPoint.latitude),
                longitude: Number(payload.centerPoint.longitude)
            },
            radiusMeters: Number(payload.radiusMeters)
        };
    }
}
