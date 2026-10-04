import { Location } from './location.js';

/**
 * Entidad Aggregate Root Vehicle (Unidad de Transporte) dentro de BC-04 (§4.6.1, §4.7.1).
 * Invariante: Un dispositivo GPS no puede estar vinculado a más de una unidad al mismo tiempo.
 *
 * @class Vehicle
 */
export class Vehicle {
    /**
     * @param {Object} params
     * @param {string|number|null} [params.id=null]
     * @param {string} [params.companyId='']
     * @param {string} [params.licensePlate='']
     * @param {string} [params.brand='']
     * @param {string} [params.model='']
     * @param {number} [params.maxCapacityTons=0]
     * @param {string|null} [params.gpsDeviceId=null]
     * @param {Location|Object|null} [params.currentPos=null]
     */
    constructor({
        id = null,
        companyId = '',
        licensePlate = '',
        brand = '',
        model = '',
        maxCapacityTons = 0,
        gpsDeviceId = null,
        currentPos = null
    } = {}) {
        this.id = id;
        this.companyId = companyId;
        this.licensePlate = Vehicle.normalizeLicensePlate(licensePlate);
        this.brand = brand;
        this.model = model;
        this.maxCapacityTons = Number(maxCapacityTons) || 0;
        this.gpsDeviceId = gpsDeviceId ? String(gpsDeviceId).trim() : null;
        this.currentPos = currentPos instanceof Location ? currentPos : (currentPos ? new Location(currentPos) : null);
    }

    /**
     * Normaliza la placa vehicular a mayúsculas y sin espacios intermedios (§3.5).
     * @param {string} plate
     * @returns {string}
     */
    static normalizeLicensePlate(plate) {
        if (!plate) return '';
        return String(plate).trim().toUpperCase().replace(/\s+/g, '');
    }

    /**
     * Estado derivado que indica si la unidad tiene un dispositivo GPS asignado.
     * @returns {boolean}
     */
    get isGpsPaired() {
        return Boolean(this.gpsDeviceId && this.gpsDeviceId.trim().length > 0);
    }

    /**
     * Vincula un dispositivo telemático GPS a la unidad.
     * @param {string} deviceId
     */
    pairGpsDevice(deviceId) {
        if (!deviceId || !String(deviceId).trim()) {
            throw new Error('El ID del dispositivo GPS no puede estar vacío.');
        }
        this.gpsDeviceId = String(deviceId).trim();
    }

    /**
     * Desvincula el dispositivo GPS actual.
     */
    unpairGpsDevice() {
        this.gpsDeviceId = null;
    }

    /**
     * Actualiza la última posición telemática reportada.
     * @param {Location} location
     */
    updatePosition(location) {
        if (!(location instanceof Location)) {
            throw new Error('La posición debe ser una instancia de Location.');
        }
        this.currentPos = location;
    }
}
