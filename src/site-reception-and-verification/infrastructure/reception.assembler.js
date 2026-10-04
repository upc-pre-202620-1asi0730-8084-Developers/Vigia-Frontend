import { Reception } from '../domain/reception.entity.js';
import { ReceptionItem } from '../domain/reception-item.entity.js';
import { SupportingEvidence } from '../domain/supporting-evidence.entity.js';
import { ReceptionChecklist } from '../domain/reception-checklist.js';

/**
 * Assembler para transformar entre recursos JSON de la API REST y entidades del modelo de dominio.
 *
 * @class ReceptionAssembler
 */
export class ReceptionAssembler {
    /**
     * Mapea un ítem JSON a la entidad ReceptionItem.
     * @param {Object} resource
     * @returns {ReceptionItem}
     */
    static toItemEntity(resource) {
        if (!resource) return null;
        return new ReceptionItem({
            id: resource.id,
            receptionId: resource.receptionId,
            materialName: resource.materialName,
            dispatchedQuantity: resource.dispatchedQuantity,
            receivedQuantity: resource.receivedQuantity,
            unit: resource.unit
        });
    }

    /**
     * Mapea una entidad ReceptionItem a recurso DTO para la API.
     * @param {ReceptionItem} entity
     * @returns {Object}
     */
    static toItemResource(entity) {
        if (!entity) return null;
        return {
            id: entity.id,
            receptionId: entity.receptionId,
            materialName: entity.materialName,
            dispatchedQuantity: Number(entity.dispatchedQuantity),
            receivedQuantity: Number(entity.receivedQuantity),
            unit: entity.unit,
            difference: entity.difference
        };
    }

    /**
     * Mapea una evidencia JSON a la entidad SupportingEvidence.
     * @param {Object} resource
     * @returns {SupportingEvidence}
     */
    static toEvidenceEntity(resource) {
        if (!resource) return null;
        return new SupportingEvidence({
            id: resource.id,
            receptionId: resource.receptionId,
            evidenceUrl: resource.evidenceUrl,
            capturedAt: resource.capturedAt,
            caption: resource.caption,
            type: resource.type
        });
    }

    /**
     * Mapea una entidad SupportingEvidence a recurso DTO.
     * @param {SupportingEvidence} entity
     * @returns {Object}
     */
    static toEvidenceResource(entity) {
        if (!entity) return null;
        return {
            id: entity.id,
            receptionId: entity.receptionId,
            evidenceUrl: entity.evidenceUrl,
            capturedAt: entity.capturedAt,
            caption: entity.caption,
            type: entity.type
        };
    }

    /**
     * Convierte un recurso JSON en entidad Aggregate Root Reception.
     * @param {Object} resource
     * @returns {Reception}
     */
    static toEntityFromResource(resource) {
        if (!resource) return null;

        const items = (resource.items || []).map(i => this.toItemEntity(i));
        const evidences = (resource.evidences || []).map(e => this.toEvidenceEntity(e));
        const checklist = new ReceptionChecklist(resource.checklist || {});

        return new Reception({
            id: resource.id,
            dispatchId: resource.dispatchId,
            verifiedByUserId: resource.verifiedByUserId,
            verifiedByUserName: resource.verifiedByUserName,
            siteId: resource.siteId,
            siteName: resource.siteName,
            origin: resource.origin,
            truckPlate: resource.truckPlate,
            driverName: resource.driverName,
            deliveryGuideNumber: resource.deliveryGuideNumber,
            arrivedAt: resource.arrivedAt,
            closedAt: resource.closedAt,
            status: resource.status,
            observations: resource.observations,
            items: items,
            evidences: evidences,
            checklist: checklist
        });
    }

    /**
     * Convierte la respuesta Axios en un arreglo de entidades Reception.
     * @param {import('axios').AxiosResponse} response
     * @returns {Reception[]}
     */
    static toEntitiesFromResponse(response) {
        if (!response || !response.data) return [];
        const list = Array.isArray(response.data) ? response.data : (response.data.receptions || []);
        return list.map(r => this.toEntityFromResource(r));
    }

    /**
     * Convierte una entidad o formulario de recepción a recurso JSON para persistir en backend.
     * @param {Reception|Object} entity
     * @returns {Object}
     */
    static toResourceFromEntity(entity) {
        if (!entity) return null;
        return {
            id: entity.id,
            dispatchId: entity.dispatchId,
            verifiedByUserId: entity.verifiedByUserId,
            verifiedByUserName: entity.verifiedByUserName,
            siteId: entity.siteId,
            siteName: entity.siteName,
            origin: entity.origin,
            truckPlate: entity.truckPlate,
            driverName: entity.driverName,
            deliveryGuideNumber: entity.deliveryGuideNumber,
            arrivedAt: entity.arrivedAt,
            closedAt: entity.closedAt,
            status: entity.status,
            observations: entity.observations,
            items: (entity.items || []).map(i => this.toItemResource(i)),
            evidences: (entity.evidences || []).map(e => this.toEvidenceResource(e)),
            checklist: {
                materialGoodCondition: Boolean(entity.checklist?.materialGoodCondition),
                quantityVerified: Boolean(entity.checklist?.quantityVerified),
                deliveryGuideReceived: Boolean(entity.checklist?.deliveryGuideReceived),
                photographicEvidence: Boolean(entity.checklist?.photographicEvidence),
                observationsRecorded: Boolean(entity.checklist?.observationsRecorded)
            }
        };
    }
}
