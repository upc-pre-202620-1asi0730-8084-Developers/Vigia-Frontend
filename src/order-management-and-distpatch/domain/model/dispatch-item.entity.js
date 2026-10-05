/**
 * Entidad DispatchItem: línea de material incluida en un Dispatch.
 */
export class DispatchItem {
    constructor({ id, code, material, quantity, unit, observation = '' }) {
        this.id = id;
        this.code = code;
        this.material = material;
        this.quantity = Number(quantity) || 0;
        this.unit = unit;
        this.observation = observation;
    }
}
