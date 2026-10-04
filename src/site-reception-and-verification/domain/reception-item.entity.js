/**
 * Entidad ReceptionItem dentro de BC-07 Site Reception and Verification (§4.7.1, §4.8.1).
 * Representa cada material cotejado en obra contra la guía de remisión del despacho.
 * Invariante: dispatchedQuantity >= 0 y receivedQuantity >= 0 (ck_reception_items_quantities).
 * La diferencia se deriva dinámicamente: diferencia = dispatchedQuantity - receivedQuantity.
 *
 * @class ReceptionItem
 */
export class ReceptionItem {
    /**
     * @param {Object} params
     * @param {string|number|null} [params.id=null]
     * @param {string|number|null} [params.receptionId=null]
     * @param {string} [params.materialName='']
     * @param {number} [params.dispatchedQuantity=0]
     * @param {number} [params.receivedQuantity=0]
     * @param {string} [params.unit='t']
     */
    constructor({
        id = null,
        receptionId = null,
        materialName = '',
        dispatchedQuantity = 0,
        receivedQuantity = 0,
        unit = 't'
    } = {}) {
        this.id = id;
        this.receptionId = receptionId;
        this.materialName = String(materialName || '').trim();
        this.dispatchedQuantity = Math.max(0, Number(dispatchedQuantity) || 0);
        this.receivedQuantity = Math.max(0, Number(receivedQuantity) || 0);
        this.unit = String(unit || 't').trim();
    }

    /**
     * Diferencia matemática entre lo despachado y lo recibido.
     * Si > 0: faltante (shortage).
     * Si < 0: sobrante / exceso.
     * Si === 0: exacto conforme.
     * @returns {number}
     */
    get difference() {
        const diff = this.dispatchedQuantity - this.receivedQuantity;
        return Number(diff.toFixed(3));
    }

    /**
     * Indica si la cantidad recibida coincide con la despachada.
     * @returns {boolean}
     */
    get isConformant() {
        return Math.abs(this.difference) < 0.001;
    }

    /**
     * Indica si hay faltante de material en la entrega.
     * @returns {boolean}
     */
    get hasShortage() {
        return this.difference > 0.001;
    }

    /**
     * Actualiza la cantidad física constatada en obra.
     * @param {number} quantity
     */
    updateReceivedQuantity(quantity) {
        const num = Number(quantity);
        if (isNaN(num) || num < 0) {
            throw new Error('La cantidad recibida no puede ser negativa ni inválida.');
        }
        this.receivedQuantity = Math.max(0, Number(num.toFixed(3)));
    }
}
