/**
 * Objeto de valor / Checklist de control de calidad al recibir la carga en obra (§4.4.3).
 * Refleja el checklist del mock-up de Responsable de Obra:
 * - Material in good condition (Material en buen estado)
 * - Verified quantity (Cantidad verificada)
 * - Delivery guide received (Guía de remisión recibida)
 * - Photographic evidence (Evidencia fotográfica)
 * - Observations recorded (Observaciones registradas)
 *
 * @class ReceptionChecklist
 */
export class ReceptionChecklist {
    /**
     * @param {Object} [params]
     * @param {boolean} [params.materialGoodCondition=false]
     * @param {boolean} [params.quantityVerified=false]
     * @param {boolean} [params.deliveryGuideReceived=false]
     * @param {boolean} [params.photographicEvidence=false]
     * @param {boolean} [params.observationsRecorded=false]
     */
    constructor({
        materialGoodCondition = false,
        quantityVerified = false,
        deliveryGuideReceived = false,
        photographicEvidence = false,
        observationsRecorded = false
    } = {}) {
        this.materialGoodCondition = Boolean(materialGoodCondition);
        this.quantityVerified = Boolean(quantityVerified);
        this.deliveryGuideReceived = Boolean(deliveryGuideReceived);
        this.photographicEvidence = Boolean(photographicEvidence);
        this.observationsRecorded = Boolean(observationsRecorded);
    }

    /**
     * Evalúa si el checklist mínimo para conformidad está completo.
     * @returns {boolean}
     */
    get isCompleteForConformity() {
        return this.materialGoodCondition && this.quantityVerified && this.deliveryGuideReceived;
    }
}
