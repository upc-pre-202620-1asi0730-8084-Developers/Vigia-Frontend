import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { OrderManagementApi } from '../infrastructure/order-management-api.js';
import { OrderAssembler } from '../infrastructure/order.assembler.js';
import { ORDER_STATUS } from '../domain/order-status.js';

const api = new OrderManagementApi();

/**
 * Store de aplicación para las Orders (Solicitudes) — BC-05 Ordering and Dispatch.
 */
export const useOrderStore = defineStore('orders', () => {
    const orders = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // KPIs del dashboard de Solicitudes (mockup Requests).
    const pendingCount = computed(() => orders.value.filter(o => o.status === ORDER_STATUS.PENDING).length);
    const approvedCount = computed(() => orders.value.filter(o => o.status === ORDER_STATUS.APPROVED).length);
    const underReviewCount = computed(() => orders.value.filter(o => o.status === ORDER_STATUS.UNDER_REVIEW).length);
    const urgentCount = computed(() => orders.value.filter(o => o.priority === 'HIGH' && o.status !== ORDER_STATUS.REJECTED).length);

    async function loadOrders() {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.getOrders();
            orders.value = OrderAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            error.value = err;
        } finally {
            loading.value = false;
        }
    }

    function getOrderById(id) {
        return orders.value.find(o => String(o.id) === String(id));
    }

    /**
     * Cambia el estado de una Order y persiste el cambio (approve / reject / request changes).
     * @param {string} id
     * @param {string} newStatus
     * @param {string} note
     */
    async function changeStatus(id, newStatus, note = '') {
        const order = getOrderById(id);
        if (!order) return null;

        order.status = newStatus;
        order.timeline = [
            ...(order.timeline || []),
            {
                id: (order.timeline?.length || 0) + 1,
                title: note || newStatus,
                user: 'Carlos Mendoza',
                description: note || `Status changed to ${newStatus}.`,
                date: new Date().toISOString().slice(0, 16).replace('T', ' ')
            }
        ];

        try {
            const response = await api.updateOrder(id, OrderAssembler.toResource(order));
            const updated = OrderAssembler.toEntity(response.data);
            const index = orders.value.findIndex(o => String(o.id) === String(id));
            if (index !== -1) orders.value[index] = updated;
            return updated;
        } catch (err) {
            error.value = err;
            return null;
        }
    }

    return {
        orders,
        loading,
        error,
        pendingCount,
        approvedCount,
        underReviewCount,
        urgentCount,
        loadOrders,
        getOrderById,
        changeStatus
    };
});

export default useOrderStore;
