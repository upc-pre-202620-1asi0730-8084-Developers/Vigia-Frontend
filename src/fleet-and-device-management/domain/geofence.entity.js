import { Location } from './location.js';
import { GeofenceType } from './geofence-type.js';

/**
 * Entidad Aggregate Root Geofence (Geocerca) dentro de BC-04 (§4.6.1, §4.7.1).
 * Invariante: Una geocerca pertenece a un único predio (almacén u obra) por empresa.
 *
 * @class Geofence
 */
export class Geofence {
    /**
     * @param {Object} params
     * @param {string|number|null} [params.id=null]
     * @param {string} [params.companyId='']
     * @param {string} [params.siteId=''] - Identificador del predio (almacén u obra).
     * @param {string} [params.name='']
     * @param {string} [params.type=GeofenceType.WAREHOUSE]
     * @param {Location|Object} params.centerPoint
     * @param {number} [params.radiusMeters=100]
     */
    constructor({
        id = null,
        companyId = '',
        siteId = '',
        name = '',
        type = GeofenceType.WAREHOUSE,
        centerPoint,
        radiusMeters = 100
    } = {}) {
        this.id = id;
        this.companyId = companyId;
        this.siteId = siteId;
        this.name = name;
        this.type = type;
        this.centerPoint = centerPoint instanceof Location ? centerPoint : new Location(centerPoint);
        this.radiusMeters = Number(radiusMeters) || 100;
    }

    /**
     * Evalúa si una coordenada geográfica se encuentra dentro del radio perimetral de la geocerca.
     * @param {Location} location
     * @returns {boolean}
     */
    contains(location) {
        if (!location) return false;
        const target = location instanceof Location ? location : new Location(location);
        const distance = this.centerPoint.getDistanceTo(target);
        return distance <= this.radiusMeters;
    }
}
