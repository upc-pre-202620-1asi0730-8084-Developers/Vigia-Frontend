/**
 * DispatchItem entity within the Order Management and Dispatch bounded context.
 *
 * @class DispatchItem
 */
export class DispatchItem {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Dispatch item identifier.
     * @param {string} [params.code=''] - Material code.
     * @param {string} [params.material=''] - Material name.
     * @param {number} [params.quantity=0] - Dispatched quantity.
     * @param {string} [params.unit=''] - Unit of measure.
     * @param {string} [params.observation=''] - Optional observation for the line.
     */
    constructor({ id = null, code = '', material = '', quantity = 0, unit = '', observation = '' }) {
        this.id = id;
        this.code = code;
        this.material = material;
        this.quantity = quantity;
        this.unit = unit;
        this.observation = observation;
    }
}
