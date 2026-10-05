import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { OrderManagementApi } from '../infrastructure/order-management-api.js';
import { DispatchAssembler } from '../infrastructure/dispatch.assembler.js';
import { DISPATCH_STATUS } from '../domain/dispatch-status.js';

const api = new OrderManagementApi();

/**
 * Store de aplicación para los Dispatches (Despachos) — BC-05 Ordering and Dispatch.
 */
export const useDispatchStore = defineStore('dispatches', () => {
    const dispatches = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // KPIs del dashboard de Despachos (mockup Dispatches).
    const inPreparationCount = computed(() => dispatches.value.filter(d => d.status === DISPATCH_STATUS.IN_PREPARATION).length);
    const scheduledCount = computed(() => dispatches.value.filter(d => d.status === DISPATCH_STATUS.SCHEDULED).length);
    const inTransitCount = computed(() => dispatches.value.filter(d => d.status === DISPATCH_STATUS.IN_TRANSIT).length);
    const withIncidentCount = computed(() => dispatches.value.filter(d => d.status === DISPATCH_STATUS.WITH_INCIDENT).length);

    async function loadDispatches() {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.getDispatches();
            dispatches.value = DispatchAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            error.value = err;
        } finally {
            loading.value = false;
        }
    }

    function getDispatchById(id) {
        return dispatches.value.find(d => String(d.id) === String(id));
    }

    /**
     * Genera el siguiente ID correlativo de despacho (DS-###).
     */
    function nextDispatchId() {
        const numbers = dispatches.value
            .map(d => parseInt(String(d.id).replace(/[^0-9]/g, ''), 10))
            .filter(n => !Number.isNaN(n));
        const max = numbers.length ? Math.max(...numbers) : 103;
        return `DS-${max + 1}`;
    }

    /**
     * Crea un nuevo Dispatch (paso 1 del asistente de Nuevo Despacho).
     * @param {Object} formData
     */
    async function createDispatch(formData) {
        const id = formData.id || nextDispatchId();
        const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

        const resource = DispatchAssembler.toResource({
            id,
            projectName: formData.projectName,
            siteId: formData.siteId || '',
            address: formData.address || '',
            departureDate: formData.departureDate,
            estimatedTime: formData.estimatedTime,
            relatedOrderId: formData.relatedOrderId || null,
            dispatchType: formData.dispatchType,
            priority: formData.priority || 'AVERAGE',
            status: DISPATCH_STATUS.IN_PREPARATION,
            createdBy: 'Carlos Mendoza',
            createdAt: now,
            internalReference: formData.internalReference || '',
            observations: formData.observations || '',
            items: formData.items || [],
            transportId: null,
            transportPlate: null,
            driverName: null,
            timeline: [
                { id: 1, event: 'Dispatch created', user: 'Carlos Mendoza', description: `Dispatch ${id} has been created.`, date: now }
            ]
        });

        try {
            const response = await api.createDispatch(resource);
            const created = DispatchAssembler.toEntity(response.data);
            dispatches.value.unshift(created);
            return created;
        } catch (err) {
            error.value = err;
            return null;
        }
    }

    return {
        dispatches,
        loading,
        error,
        inPreparationCount,
        scheduledCount,
        inTransitCount,
        withIncidentCount,
        loadDispatches,
        getDispatchById,
        nextDispatchId,
        createDispatch
    };
});

export default useDispatchStore;
