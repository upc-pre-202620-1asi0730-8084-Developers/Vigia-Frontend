/**
 * Estructuras de recursos HTTP para el Bounded Context BC-07 Site Reception and Verification (§4.7.1).
 */

/**
 * Recurso DTO para ítems de recepción transferidos por la API REST.
 * @typedef {Object} ReceptionItemResource
 * @property {string|number} id
 * @property {string|number} receptionId
 * @property {string} materialName
 * @property {number} dispatchedQuantity
 * @property {number} receivedQuantity
 * @property {string} unit
 */

/**
 * Recurso DTO para evidencias fotográficas de sustento.
 * @typedef {Object} SupportingEvidenceResource
 * @property {string|number} id
 * @property {string|number} receptionId
 * @property {string} evidenceUrl
 * @property {string} capturedAt
 * @property {string} caption
 * @property {string} [type]
 */

/**
 * Recurso DTO principal para la entidad Reception.
 * @typedef {Object} ReceptionResource
 * @property {string|number} id
 * @property {string|number} dispatchId
 * @property {string|number} verifiedByUserId
 * @property {string} verifiedByUserName
 * @property {string} siteId
 * @property {string} siteName
 * @property {string} origin
 * @property {string} truckPlate
 * @property {string} driverName
 * @property {string} deliveryGuideNumber
 * @property {string} arrivedAt
 * @property {string|null} closedAt
 * @property {string} status
 * @property {string} observations
 * @property {ReceptionItemResource[]} items
 * @property {SupportingEvidenceResource[]} evidences
 * @property {Object} checklist
 */
