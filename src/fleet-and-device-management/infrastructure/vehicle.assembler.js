import { Vehicle } from '../domain/vehicle.entity.js';
import { Location } from '../domain/location.js';

/**
 * Assembler para transformar entre recursos HTTP de vehículos y entidades del dominio.
 *
 * @class VehicleAssembler
 */
export class VehicleAssembler {
    /**
     * Convierte un recurso JSON en entidad Vehicle.
     * @param {Object} resource
     * @returns {Vehicle}
     */
    static toEntityFromResource(resource) {
        if (!resource) return null;
        let currentPos = null;
        if (resource.currentPos && typeof resource.currentPos.latitude === 'number') {
            currentPos = new Location({
                latitude: resource.currentPos.latitude,
                longitude: resource.currentPos.longitude
            });
        }
        return new Vehicle({
            id: resource.id,
            companyId: resource.companyId,
            licensePlate: resource.licensePlate,
            brand: resource.brand,
            model: resource.model,
            maxCapacityTons: resource.maxCapacityTons,
            gpsDeviceId: resource.gpsDeviceId,
            currentPos: currentPos
        });
    }

    /**
     * Convierte la respuesta HTTP en un arreglo de entidades Vehicle.
     * @param {import('axios').AxiosResponse} response
     * @returns {Vehicle[]}
     */
    static toEntitiesFromResponse(response) {
        if (!response || !response.data) return [];
        const resources = Array.isArray(response.data) ? response.data : (response.data.vehicles || []);
        return resources.map(r => this.toEntityFromResource(r));
    }

    /**
     * Mapea una entidad o formulario de creación a recurso HTTP.
     * @param {Object} entity
     * @returns {Object}
     */
    static toResourceFromEntity(entity) {
        return {
            companyId: entity.companyId,
            licensePlate: Vehicle.normalizeLicensePlate(entity.licensePlate),
            brand: entity.brand,
            model: entity.model,
            maxCapacityTons: Number(entity.maxCapacityTons),
            gpsDeviceId: entity.gpsDeviceId ? String(entity.gpsDeviceId).trim() : null
        };
    }
}
