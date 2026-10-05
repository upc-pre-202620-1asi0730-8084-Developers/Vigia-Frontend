/**
 * Entidad OrderItem: línea de material solicitada dentro de una Order.
 */
export class OrderItem {
    constructor({ id, material, quantity, unit, observation = '' }) {
        this.id = id;
        this.material = material;
        this.quantity = Number(quantity) || 0;
        this.unit = unit;
        this.observation = observation;
    }
}
