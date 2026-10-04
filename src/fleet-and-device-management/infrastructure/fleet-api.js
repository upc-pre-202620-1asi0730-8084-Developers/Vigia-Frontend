import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const vehiclesEndpointPath = import.meta.env.VITE_VEHICLES_ENDPOINT_PATH || '/vehicles';
const geofencesEndpointPath = import.meta.env.VITE_GEOFENCES_ENDPOINT_PATH || '/geofences';
const telemetryEndpointPath = import.meta.env.VITE_TELEMETRY_ENDPOINT_PATH || '/telemetry/reports';

/**
 * Cliente de infraestructura API para el Bounded Context BC-04 Fleet and Device Management.
 * Normaliza errores HTTP a { status, code, message, details } y gestiona endpoints de flota.
 *
 * @class FleetApi
 * @extends BaseApi
 */
export class FleetApi extends BaseApi {
    #vehiclesEndpoint;
    #geofencesEndpoint;
    #telemetryEndpoint;

    constructor() {
        super();
        this.#vehiclesEndpoint = new BaseEndpoint(this, vehiclesEndpointPath);
        this.#geofencesEndpoint = new BaseEndpoint(this, geofencesEndpointPath);
        this.#telemetryEndpoint = new BaseEndpoint(this, telemetryEndpointPath);

        // Interceptor para normalización de errores (§3.5)
        this.http.interceptors.response.use(
            response => response,
            error => {
                const status = error.response ? error.response.status : 0;
                const data = error.response ? error.response.data : null;

                const normalized = {
                    status,
                    code: data?.code || (status === 0 ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR'),
                    message: data?.title || data?.message || error.message || 'Error en la solicitud.',
                    details: data?.details || data?.detail || null,
                    assignedLicensePlate: data?.assignedLicensePlate || null,
                    raw: error
                };

                // Manejo global para 401, 5xx y fallas de red
                if (status === 401) {
                    console.error('[FleetApi] Error de autenticación (401)');
                } else if (status >= 500) {
                    console.error('[FleetApi] Error de servidor (5xx):', normalized.message);
                } else if (status === 0) {
                    console.error('[FleetApi] Sin conexión con el servidor.');
                }

                // 409 y validaciones se rechazan normalizadas para manejo en línea en cada vista
                return Promise.reject(normalized);
            }
        );
    }

    /**
     * Obtiene la lista de vehículos, con filtro opcional por vinculación GPS.
     * @param {Object} [params]
     * @param {boolean} [params.isGpsPaired]
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getVehicles(params = {}) {
        return this.http.get(vehiclesEndpointPath, { params });
    }

    /**
     * Obtiene una unidad de transporte por su ID.
     * @param {string|number} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getVehicleById(id) {
        return this.#vehiclesEndpoint.getById(id);
    }

    /**
     * Registra una nueva unidad de transporte.
     * @param {Object} vehicleResource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createVehicle(vehicleResource) {
        return this.#vehiclesEndpoint.create(vehicleResource);
    }

    /**
     * Vincula un dispositivo GPS a una unidad de transporte.
     * @param {string|number} vehicleId
     * @param {string} gpsDeviceId
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    pairGpsDevice(vehicleId, gpsDeviceId) {
        return this.http.post(`${vehiclesEndpointPath}/${vehicleId}/gps-device`, { gpsDeviceId });
    }

    /**
     * Obtiene las geocercas, con filtro opcional por tipo (WAREHOUSE / JOB_SITE).
     * @param {string} [type]
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getGeofences(type) {
        const params = type ? { type } : {};
        return this.http.get(geofencesEndpointPath, { params });
    }

    /**
     * Define y persiste una nueva geocerca de predio.
     * @param {Object} geofenceResource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createGeofence(geofenceResource) {
        return this.#geofencesEndpoint.create(geofenceResource);
    }

    /**
     * Envía reporte telemático de posición (TS-08).
     * @param {Object} reportPayload
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    sendTelemetryReport(reportPayload) {
        return this.#telemetryEndpoint.create(reportPayload);
    }
}
