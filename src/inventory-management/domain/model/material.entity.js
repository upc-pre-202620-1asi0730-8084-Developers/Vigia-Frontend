import {STOCK_STATUS} from "../material-category.js";

/**
 * Material entity (stocked construction material) within the Inventory Management bounded context.
 * Invariant: a material is in low stock when its current stock is below its minimum stock.
 *
 * @class Material
 */
export class Material {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Material identifier (e.g. MAT-001).
     * @param {string} [params.name=''] - Material name.
     * @param {string} [params.category=''] - Category (MATERIAL_CATEGORY).
     * @param {string} [params.unit=''] - Unit of measure (kg, m³, u, m, gal).
     * @param {number} [params.currentStock=0] - Quantity available in the warehouse.
     * @param {number} [params.minimumStock=0] - Quantity below which the material must be restocked.
     * @param {?string} [params.projectId=null] - Project the stock is reserved for (Project.id).
     * @param {string} [params.projectName=''] - Project name, for display.
     */
    constructor({ id = null, name = '', category = '', unit = '', currentStock = 0, minimumStock = 0,
                  projectId = null, projectName = '' }) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.unit = unit;
        this.currentStock = Number(currentStock) || 0;
        this.minimumStock = Number(minimumStock) || 0;
        this.projectId = projectId;
        this.projectName = projectName;
    }

    /** @returns {string} Stock status derived from current and minimum stock. */
    get stockStatus() {
        return this.currentStock < this.minimumStock ? STOCK_STATUS.LOW_STOCK : STOCK_STATUS.IN_STOCK;
    }

    /** @returns {boolean} Whether the material must be restocked. */
    get isLowStock() {
        return this.stockStatus === STOCK_STATUS.LOW_STOCK;
    }
}
