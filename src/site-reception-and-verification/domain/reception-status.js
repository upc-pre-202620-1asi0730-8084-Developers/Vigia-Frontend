/**
 * Estados del ciclo de vida de una Recepción en Obra dentro de BC-07 (§4.6.1, §4.7.1, §4.8.1).
 * Restricción CHECK de base de datos: status IN ('ARRIVED', 'VERIFIED_CONFORMANT', 'VERIFIED_DISCREPANT').
 */
export const RECEPTION_STATUS = Object.freeze({
    /** Unidad ha ingresado a la geocerca de la obra y se registra su llegada */
    ARRIVED: 'ARRIVED',
    /** Cotejo completado con cantidades 100% coincidentes y sin daños */
    VERIFIED_CONFORMANT: 'VERIFIED_CONFORMANT',
    /** Se detectó faltante, sobrante o daño físico respaldado con evidencia */
    VERIFIED_DISCREPANT: 'VERIFIED_DISCREPANT'
});

/**
 * Normaliza y valida un estado de recepción.
 * @param {string} status
 * @returns {string}
 */
export function normalizeReceptionStatus(status) {
    if (!status) return RECEPTION_STATUS.ARRIVED;
    const upper = String(status).trim().toUpperCase();
    if (Object.values(RECEPTION_STATUS).includes(upper)) {
        return upper;
    }
    // Mapeo retrocompatible con mockups en inglés/español
    if (upper === 'COMPLETED' || upper === 'CONFORME') return RECEPTION_STATUS.VERIFIED_CONFORMANT;
    if (upper === 'PARTIAL' || upper === 'WITH DIFFERENCE' || upper === 'UNDER REVIEW' || upper === 'DISCREPANT') {
        return RECEPTION_STATUS.VERIFIED_DISCREPANT;
    }
    return RECEPTION_STATUS.ARRIVED;
}
