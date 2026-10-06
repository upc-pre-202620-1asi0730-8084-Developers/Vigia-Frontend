import {OrderItem} from "./order-item.entity.js";

/**
 * Order entity (material request) within the Order Management and Dispatch bounded context.
 *
 * @class Order
 */
export class Order {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Order identifier (e.g. SOL-104).
     * @param {string} [params.projectName=''] - Work that requested the materials.
     * @param {string} [params.requesterName=''] - Person who created the order.
     * @param {string} [params.status='PENDING'] - Order status.
     * @param {string} [params.priority='AVERAGE'] - Order priority.
     * @param {string} [params.date=''] - Creation date.
     * @param {string} [params.mainMaterial=''] - Main requested material.
     * @param {OrderItem[]} [params.items=[]] - Requested material lines.
     * @param {string} [params.observations=''] - General observations.
     * @param {Object[]} [params.attachedFiles=[]] - Attached files.
     * @param {Object[]} [params.timeline=[]] - Order history events.
     */
    constructor({ id = null, projectName = '', requesterName = '', status = 'PENDING', priority = 'AVERAGE',
                  date = '', mainMaterial = '', items = [], observations = '', attachedFiles = [], timeline = [] }) {
        this.id = id;
        this.projectName = projectName;
        this.requesterName = requesterName;
        this.status = status;
        this.priority = priority;
        this.date = date;
        this.mainMaterial = mainMaterial;
        this.items = items.map(item => item instanceof OrderItem ? item : new OrderItem({...item}));
        this.observations = observations;
        this.attachedFiles = attachedFiles;
        this.timeline = timeline;
    }
}
