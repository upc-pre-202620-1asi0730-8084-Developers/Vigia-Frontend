/**
 * Categories of construction materials (Inventory Management bounded context).
 */
export const MATERIAL_CATEGORY = {
    CEMENTS: 'CEMENTS',
    STEEL: 'STEEL',
    MASONRY: 'MASONRY',
    AGGREGATES: 'AGGREGATES',
    INSTALLATIONS: 'INSTALLATIONS',
    ELECTRICAL: 'ELECTRICAL',
    FINISHES: 'FINISHES'
};

/**
 * Stock status of a material, derived from its current and minimum stock.
 */
export const STOCK_STATUS = {
    IN_STOCK: 'IN_STOCK',
    LOW_STOCK: 'LOW_STOCK'
};

/**
 * Direction of an inventory movement.
 */
export const MOVEMENT_TYPE = {
    IN: 'IN',
    OUT: 'OUT'
};

/**
 * Color severity for the pv-tag of a stock status.
 * @param {string} status
 * @returns {string}
 */
export function stockStatusSeverity(status) {
    return status === STOCK_STATUS.LOW_STOCK ? 'danger' : 'success';
}
