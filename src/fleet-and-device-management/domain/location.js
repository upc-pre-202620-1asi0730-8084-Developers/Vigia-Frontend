/**
 * Value Object Location que representa coordenadas geográficas (WGS84).
 * Valida límites de latitud (±90) y longitud (±180) y calcula distancias con Haversine.
 *
 * @class Location
 */
export class Location {
    /**
     * @param {Object} params
     * @param {number} params.latitude - Latitud en grados decimales (-90 a 90).
     * @param {number} params.longitude - Longitud en grados decimales (-180 a 180).
     */
    constructor({ latitude, longitude }) {
        const lat = Number(latitude);
        const lon = Number(longitude);

        if (isNaN(lat) || lat < -90 || lat > 90) {
            throw new Error(`Latitud inválida: ${latitude}. Debe estar en el rango [-90, 90].`);
        }
        if (isNaN(lon) || lon < -180 || lon > 180) {
            throw new Error(`Longitud inválida: ${longitude}. Debe estar en el rango [-180, 180].`);
        }

        this.latitude = lat;
        this.longitude = lon;
        Object.freeze(this);
    }

    /**
     * Calcula la distancia geodésica en metros hacia otra ubicación utilizando la fórmula de Haversine.
     * @param {Location} other - Otra ubicación geográfica.
     * @returns {number} Distancia en metros.
     */
    getDistanceTo(other) {
        if (!other || typeof other.latitude !== 'number' || typeof other.longitude !== 'number') {
            throw new Error('La ubicación de destino para el cálculo de distancia no es válida.');
        }

        const R = 6371000; // Radio de la Tierra en metros
        const toRad = deg => (deg * Math.PI) / 180;

        const dLat = toRad(other.latitude - this.latitude);
        const dLon = toRad(other.longitude - this.longitude);
        const lat1 = toRad(this.latitude);
        const lat2 = toRad(other.latitude);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    toJSON() {
        return {
            latitude: this.latitude,
            longitude: this.longitude
        };
    }
}
