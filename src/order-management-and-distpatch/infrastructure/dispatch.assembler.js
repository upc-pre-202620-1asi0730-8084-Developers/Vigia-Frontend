import { Dispatch } from '../domain/model/dispatch.entity.js';
import { DispatchItem } from '../domain/model/dispatch-item.entity.js';

/**
 * Assembler para transformar entre recursos JSON de la API y entidades Dispatch/DispatchItem.
 *
 * @class DispatchAssembler
 */
export class DispatchAssembler {
    static toItemEntity(resource) {
        return new DispatchItem({
            id: resource.id,
            code: resource.code,
            material: resource.material,
            quantity: resource.quantity,
            unit: resource.unit,
            observation: resource.observation
        });
    }

    static toEntity(resource) {
        return new Dispatch({
            id: resource.id,
            projectName: resource.projectName,
            siteId: resource.siteId,
            address: resource.address,
            departureDate: resource.departureDate,
            estimatedTime: resource.estimatedTime,
            relatedOrderId: resource.relatedOrderId,
            dispatchType: resource.dispatchType,
            priority: resource.priority,
            status: resource.status,
            createdBy: resource.createdBy,
            createdAt: resource.createdAt,
            internalReference: resource.internalReference,
            observations: resource.observations,
            items: (resource.items || []).map(item => this.toItemEntity(item)),
            transportId: resource.transportId,
            transportPlate: resource.transportPlate,
            driverName: resource.driverName,
            timeline: resource.timeline || []
        });
    }

    static toEntitiesFromResponse(response) {
        if (!response || !response.data) return [];
        const list = Array.isArray(response.data) ? response.data : [response.data];
        return list.map(resource => this.toEntity(resource));
    }

    /**
     * Convierte una entidad Dispatch en recurso JSON para persistir en el backend.
     * @param {Dispatch} entity
     * @returns {Object}
     */
    static toResource(entity) {
        return {
            id: entity.id,
            projectName: entity.projectName,
            siteId: entity.siteId,
            address: entity.address,
            departureDate: entity.departureDate,
            estimatedTime: entity.estimatedTime,
            relatedOrderId: entity.relatedOrderId || null,
            dispatchType: entity.dispatchType,
            priority: entity.priority,
            status: entity.status,
            createdBy: entity.createdBy,
            createdAt: entity.createdAt,
            internalReference: entity.internalReference || '',
            observations: entity.observations || '',
            items: (entity.items || []).map(item => ({
                id: item.id,
                code: item.code,
                material: item.material,
                quantity: Number(item.quantity),
                unit: item.unit,
                observation: item.observation || ''
            })),
            transportId: entity.transportId || null,
            transportPlate: entity.transportPlate || null,
            driverName: entity.driverName || null,
            timeline: entity.timeline || []
        };
    }
}
