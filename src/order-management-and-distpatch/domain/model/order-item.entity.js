/**
 * OrderItem entity within the Order Management and Dispatch bounded context.
 *
 * @class OrderItem
 */
export class OrderItem {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Order item identifier.
     * @param {string} [params.material=''] - Requested material name.
     * @param {number} [params.quantity=0] - Requested quantity.
     * @param {string} [params.unit=''] - Unit of measure.
     * @param {string} [params.observation=''] - Optional observation for the line.
     */
    constructor({ id = null, material = '', quantity = 0, unit = '', observation = '' }) {
        this.id = id;
        this.material = material;
        this.quantity = quantity;
        this.unit = unit;
        this.observation = observation;
    }
}
