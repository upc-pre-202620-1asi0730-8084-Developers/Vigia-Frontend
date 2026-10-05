import { Order } from '../domain/model/order.entity.js';
import { OrderItem } from '../domain/model/order-item.entity.js';

/**
 * Assembler para transformar entre recursos JSON de la API y entidades Order/OrderItem.
 *
 * @class OrderAssembler
 */
export class OrderAssembler {
    static toItemEntity(resource) {
        return new OrderItem({
            id: resource.id,
            material: resource.material,
            quantity: resource.quantity,
            unit: resource.unit,
            observation: resource.observation
        });
    }

    static toEntity(resource) {
        return new Order({
            id: resource.id,
            projectName: resource.projectName,
            requesterName: resource.requesterName,
            status: resource.status,
            priority: resource.priority,
            date: resource.date,
            mainMaterial: resource.mainMaterial,
            items: (resource.items || []).map(item => this.toItemEntity(item)),
            observations: resource.observations,
            attachedFiles: resource.attachedFiles || [],
            timeline: resource.timeline || []
        });
    }

    /**
     * @param {import('axios').AxiosResponse} response
     * @returns {Order[]}
     */
    static toEntitiesFromResponse(response) {
        if (!response || !response.data) return [];
        const list = Array.isArray(response.data) ? response.data : [response.data];
        return list.map(resource => this.toEntity(resource));
    }

    /**
     * Convierte una entidad Order en recurso JSON para persistir en el backend.
     * @param {Order} entity
     * @returns {Object}
     */
    static toResource(entity) {
        return {
            id: entity.id,
            projectName: entity.projectName,
            requesterName: entity.requesterName,
            status: entity.status,
            priority: entity.priority,
            date: entity.date,
            mainMaterial: entity.mainMaterial,
            items: (entity.items || []).map(item => ({
                id: item.id,
                material: item.material,
                quantity: Number(item.quantity),
                unit: item.unit,
                observation: item.observation || ''
            })),
            observations: entity.observations || '',
            attachedFiles: entity.attachedFiles || [],
            timeline: entity.timeline || []
        };
    }
}
