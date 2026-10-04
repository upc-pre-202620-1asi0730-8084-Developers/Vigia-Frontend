import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const receptionsEndpointPath = import.meta.env.VITE_RECEPTIONS_ENDPOINT_PATH || '/receptions';
const upcomingArrivalsEndpointPath = import.meta.env.VITE_UPCOMING_ARRIVALS_ENDPOINT_PATH || '/upcoming-arrivals';

/**
 * Cliente de infraestructura API para el Bounded Context BC-07 Site Reception and Verification.
 * Gestiona endpoints de recepciones en obra, verificación de cantidades (TS-04) y registro de evidencias (US-10).
 *
 * @class ReceptionApi
 * @extends BaseApi
 */
export class ReceptionApi extends BaseApi {
    #receptionsEndpoint;
    #upcomingArrivalsEndpoint;

    constructor() {
        super();
        this.#receptionsEndpoint = new BaseEndpoint(this, receptionsEndpointPath);
        this.#upcomingArrivalsEndpoint = new BaseEndpoint(this, upcomingArrivalsEndpointPath);

        // Interceptor para normalización de errores (§3.5)
        this.http.interceptors.response.use(
            response => response,
            error => {
                const status = error.response ? error.response.status : 0;
                const data = error.response ? error.response.data : null;

                const normalized = {
                    status,
                    code: data?.code || (status === 0 ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR'),
                    message: data?.title || data?.message || error.message || 'Error en la operación de recepción.',
                    details: data?.details || data?.detail || null,
                    raw: error
                };

                if (status === 401) {
                    console.error('[ReceptionApi] Error de autenticación (401)');
                } else if (status >= 500) {
                    console.error('[ReceptionApi] Error de servidor (5xx):', normalized.message);
                } else if (status === 0) {
                    console.error('[ReceptionApi] Sin conexión con el servidor.');
                }

                return Promise.reject(normalized);
            }
        );
    }

    /**
     * Obtiene la lista de recepciones registradas, con filtros opcionales (obra, estado, fecha).
     * @param {Object} [params]
     * @param {string} [params.status]
     * @param {string} [params.siteName]
     * @param {string} [params.siteId]
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getReceptions(params = {}) {
        return this.http.get(receptionsEndpointPath, { params });
    }

    /**
     * Obtiene una recepción por su ID.
     * @param {string|number} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getReceptionById(id) {
        return this.#receptionsEndpoint.getById(id);
    }

    /**
     * Registra una nueva recepción física en obra (US-09).
     * @param {Object} receptionResource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createReception(receptionResource) {
        return this.#receptionsEndpoint.create(receptionResource);
    }

    /**
     * Actualiza una recepción existente.
     * @param {string|number} id
     * @param {Object} receptionResource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    updateReception(id, receptionResource) {
        return this.#receptionsEndpoint.update(id, receptionResource);
    }

    /**
     * Endpoint TS-04: Coteja las cantidades despachadas contra las recibidas y devuelve conformidad o discrepancia.
     * @param {string|number} receptionId
     * @param {Array<{ id: string|number, receivedQuantity: number }>} items
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    compareQuantities(receptionId, items) {
        return this.http.post(`${receptionsEndpointPath}/${receptionId}/compare`, { items });
    }

    /**
     * Registra conformidad o cierre de recepción en obra (US-09).
     * @param {string|number} receptionId
     * @param {Object} payload - { status, checklist, observations }
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    verifyReception(receptionId, payload) {
        return this.http.post(`${receptionsEndpointPath}/${receptionId}/verify`, payload);
    }

    /**
     * Adjunta evidencia fotográfica de sustento ante discrepancia o daño (US-10).
     * @param {string|number} receptionId
     * @param {Object} evidenceResource - { evidenceUrl, caption, type }
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    addEvidence(receptionId, evidenceResource) {
        return this.http.post(`${receptionsEndpointPath}/${receptionId}/evidences`, evidenceResource);
    }

    /**
     * Obtiene los próximos despachos en tránsito asignados a llegar a la obra.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getUpcomingArrivals() {
        return this.#upcomingArrivalsEndpoint.getAll();
    }
}
