import {MOVEMENT_TYPE} from "../material-category.js";

/**
 * Inventory movement entity (material entering or leaving the warehouse)
 * within the Inventory Management bounded context.
 *
 * @class InventoryMovement
 */
export class InventoryMovement {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Movement identifier (e.g. MOV-001).
     * @param {?string} [params.materialId=null] - Moved material (Material.id).
     * @param {string} [params.materialName=''] - Material name, for display.
     * @param {?string} [params.projectId=null] - Destination project of an outgoing movement.
     * @param {string} [params.projectName=''] - Project name, for display.
     * @param {string} [params.type=MOVEMENT_TYPE.OUT] - Movement direction (MOVEMENT_TYPE).
     * @param {number} [params.quantity=0] - Moved quantity, in the material unit.
     * @param {string} [params.unit=''] - Unit of measure.
     * @param {string} [params.date=''] - Movement date (YYYY-MM-DD).
     */
    constructor({ id = null, materialId = null, materialName = '', projectId = null, projectName = '',
                  type = MOVEMENT_TYPE.OUT, quantity = 0, unit = '', date = '' }) {
        this.id = id;
        this.materialId = materialId;
        this.materialName = materialName;
        this.projectId = projectId;
        this.projectName = projectName;
        this.type = type;
        this.quantity = Number(quantity) || 0;
        this.unit = unit;
        this.date = date;
    }

    /** @returns {boolean} Whether the material left the warehouse. */
    get isOutgoing() {
        return this.type === MOVEMENT_TYPE.OUT;
    }
}
