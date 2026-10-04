import { RECEPTION_STATUS, normalizeReceptionStatus } from './reception-status.js';
import { ReceptionItem } from './reception-item.entity.js';
import { SupportingEvidence } from './supporting-evidence.entity.js';
import { ReceptionChecklist } from './reception-checklist.js';

/**
 * Entidad Aggregate Root Reception (Recepción en Obra) dentro de BC-07 (§4.6.1, §4.7.1, §4.8.1).
 * Invariantes del dominio:
 * - uq_receptions_dispatch: Un despacho (dispatchId) solo puede tener un registro de recepción asociado.
 * - ck_receptions_status: status IN ('ARRIVED', 'VERIFIED_CONFORMANT', 'VERIFIED_DISCREPANT').
 * - La diferencia se calcula en tiempo de ejecución a partir de los ítems cotejados.
 *
 * @class Reception
 */
export class Reception {
    /**
     * @param {Object} params
     * @param {string|number|null} [params.id=null]
     * @param {string|number} [params.dispatchId='']
     * @param {string|number} [params.verifiedByUserId='']
     * @param {string} [params.verifiedByUserName='']
     * @param {string} [params.siteId='']
     * @param {string} [params.siteName='']
     * @param {string} [params.origin='']
     * @param {string} [params.truckPlate='']
     * @param {string} [params.driverName='']
     * @param {string} [params.deliveryGuideNumber='']
     * @param {string|Date} [params.arrivedAt=null]
     * @param {string|Date|null} [params.closedAt=null]
     * @param {string} [params.status='ARRIVED']
     * @param {string} [params.observations='']
     * @param {ReceptionItem[]|Object[]} [params.items=[]]
     * @param {SupportingEvidence[]|Object[]} [params.evidences=[]]
     * @param {ReceptionChecklist|Object} [params.checklist={}]
     */
    constructor({
        id = null,
        dispatchId = '',
        verifiedByUserId = '',
        verifiedByUserName = '',
        siteId = '',
        siteName = '',
        origin = '',
        truckPlate = '',
        driverName = '',
        deliveryGuideNumber = '',
        arrivedAt = null,
        closedAt = null,
        status = RECEPTION_STATUS.ARRIVED,
        observations = '',
        items = [],
        evidences = [],
        checklist = {}
    } = {}) {
        this.id = id;
        this.dispatchId = String(dispatchId || '');
        this.verifiedByUserId = String(verifiedByUserId || '');
        this.verifiedByUserName = String(verifiedByUserName || '');
        this.siteId = String(siteId || '');
        this.siteName = String(siteName || '');
        this.origin = String(origin || '');
        this.truckPlate = String(truckPlate || '');
        this.driverName = String(driverName || '');
        this.deliveryGuideNumber = String(deliveryGuideNumber || '');
        this.arrivedAt = arrivedAt ? new Date(arrivedAt).toISOString() : new Date().toISOString();
        this.closedAt = closedAt ? new Date(closedAt).toISOString() : null;
        this.status = normalizeReceptionStatus(status);
        this.observations = String(observations || '');

        this.items = (items || []).map(i => i instanceof ReceptionItem ? i : new ReceptionItem(i));
        this.evidences = (evidences || []).map(e => e instanceof SupportingEvidence ? e : new SupportingEvidence(e));
        this.checklist = checklist instanceof ReceptionChecklist ? checklist : new ReceptionChecklist(checklist);
    }

    /**
     * Resumen de material principal para tablas condensadas.
     * @returns {string}
     */
    get primaryMaterial() {
        if (!this.items.length) return 'Sin ítems';
        const first = this.items[0];
        if (this.items.length === 1) {
            return `${first.materialName} (${first.dispatchedQuantity} ${first.unit})`;
        }
        return `${first.materialName} + ${this.items.length - 1} más`;
    }

    /**
     * Suma total de unidades o toneladas despachadas.
     * @returns {number}
     */
    get totalDispatchedQuantity() {
        const sum = this.items.reduce((acc, curr) => acc + curr.dispatchedQuantity, 0);
        return Number(sum.toFixed(3));
    }

    /**
     * Suma total de unidades o toneladas efectivamente recibidas.
     * @returns {number}
     */
    get totalReceivedQuantity() {
        const sum = this.items.reduce((acc, curr) => acc + curr.receivedQuantity, 0);
        return Number(sum.toFixed(3));
    }

    /**
     * Diferencia agregada de pesaje/cubicaje.
     * @returns {number}
     */
    get totalDifference() {
        const diff = this.totalDispatchedQuantity - this.totalReceivedQuantity;
        return Number(diff.toFixed(3));
    }

    /**
     * Determina si la entrega tiene alguna discrepancia cuantitativa o cualitativa.
     * @returns {boolean}
     */
    get hasDiscrepancy() {
        const hasItemDifference = this.items.some(i => !i.isConformant);
        const isDiscrepantStatus = this.status === RECEPTION_STATUS.VERIFIED_DISCREPANT;
        const hasEvidences = this.evidences.length > 0;
        return hasItemDifference || isDiscrepantStatus || hasEvidences;
    }

    /**
     * Indica si el proceso de verificación está culminado.
     * @returns {boolean}
     */
    get isClosed() {
        return Boolean(this.closedAt) || this.status !== RECEPTION_STATUS.ARRIVED;
    }

    /**
     * Actualiza la cantidad recibida de un ítem por su ID.
     * @param {string|number} itemId
     * @param {number} receivedQuantity
     */
    verifyItemQuantity(itemId, receivedQuantity) {
        const item = this.items.find(i => String(i.id) === String(itemId));
        if (!item) {
            throw new Error(`Ítem de recepción con ID ${itemId} no encontrado.`);
        }
        item.updateReceivedQuantity(receivedQuantity);
    }

    /**
     * Adjunta una evidencia fotográfica de sustento a la recepción.
     * @param {SupportingEvidence|Object} evidence
     */
    addEvidence(evidence) {
        const ev = evidence instanceof SupportingEvidence ? evidence : new SupportingEvidence(evidence);
        this.evidences.push(ev);
        this.checklist.photographicEvidence = true;
        this.status = RECEPTION_STATUS.VERIFIED_DISCREPANT;
    }

    /**
     * Actualiza el checklist de control físico.
     * @param {Object} checklistData
     */
    updateChecklist(checklistData) {
        this.checklist = new ReceptionChecklist({
            ...this.checklist,
            ...checklistData
        });
    }

    /**
     * Confirma la recepción según el resultado del conteo y cotejo (§3.5 US-09).
     * Si no hay diferencias, se marca como VERIFIED_CONFORMANT.
     * Si hay diferencias, se marca como VERIFIED_DISCREPANT.
     */
    confirmReception() {
        this.closedAt = new Date().toISOString();
        if (this.hasDiscrepancy) {
            this.status = RECEPTION_STATUS.VERIFIED_DISCREPANT;
        } else {
            this.status = RECEPTION_STATUS.VERIFIED_CONFORMANT;
        }
    }

    /**
     * Registra explícitamente un reporte de discrepancia o incidencia en obra (§3.5 US-10).
     * @param {string} observations
     * @param {SupportingEvidence|Object|null} [evidence=null]
     */
    flagDiscrepancy(observations, evidence = null) {
        this.status = RECEPTION_STATUS.VERIFIED_DISCREPANT;
        if (observations) {
            this.observations = observations;
            this.checklist.observationsRecorded = true;
        }
        if (evidence) {
            this.addEvidence(evidence);
        }
        this.closedAt = new Date().toISOString();
    }
}
