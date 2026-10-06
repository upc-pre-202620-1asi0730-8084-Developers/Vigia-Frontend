/**
 * Entidad SupportingEvidence dentro de BC-07 Site Reception and Verification (§4.7.1, §4.8.1).
 * Registra fotografías y anotaciones de sustento ante discrepancias detectadas al descargar.
 *
 * @class SupportingEvidence
 */
export class SupportingEvidence {
    /**
     * @param {Object} params
     * @param {string|number|null} [params.id=null]
     * @param {string|number|null} [params.receptionId=null]
     * @param {string} [params.evidenceUrl='']
     * @param {string|Date} [params.capturedAt=null]
     * @param {string} [params.caption='']
     * @param {string} [params.type='PHOTO']
     */
    constructor({
        id = null,
        receptionId = null,
        evidenceUrl = '',
        capturedAt = null,
        caption = '',
        type = 'PHOTO'
    } = {}) {
        this.id = id;
        this.receptionId = receptionId;
        this.evidenceUrl = String(evidenceUrl || '').trim();
        this.capturedAt = capturedAt ? new Date(capturedAt).toISOString() : new Date().toISOString();
        this.caption = String(caption || '').trim();
        this.type = String(type || 'PHOTO').trim().toUpperCase();
    }

    /**
     * Valida la completitud de la evidencia fotográfica según reglas de auditoría (§3.5).
     * @returns {boolean}
     */
    get isValid() {
        return Boolean(this.evidenceUrl && this.caption);
    }
}
