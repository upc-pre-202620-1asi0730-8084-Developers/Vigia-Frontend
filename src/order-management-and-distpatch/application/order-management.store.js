/**
 * Application service store for the Order Management and Dispatch bounded context.
 * It coordinates order and dispatch use cases and keeps UI-facing state.
 *
 * @module useOrderManagementStore
 */
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {OrderManagementApi} from "../infrastructure/order-management-api.js";
import {OrderAssembler} from "../infrastructure/order.assembler.js";
import {DispatchAssembler} from "../infrastructure/dispatch.assembler.js";
import {Order} from "../domain/model/order.entity.js";
import {Dispatch} from "../domain/model/dispatch.entity.js";
import {ORDER_STATUS} from "../domain/order-status.js";
import {DISPATCH_STATUS} from "../domain/dispatch-status.js";

const orderManagementApi = new OrderManagementApi();

/**
 * Reactive store that exposes Order Management and Dispatch commands and queries.
 *
 * @returns {Object} Store state and actions.
 */
const useOrderManagementStore = defineStore('orderManagement', () => {
    /**
     * List of order entities.
     * @type {import('vue').Ref<Order[]>}
     */
    const orders = ref([]);
    /**
     * List of dispatch entities.
     * @type {import('vue').Ref<Dispatch[]>}
     */
    const dispatches = ref([]);
    /**
     * List of errors encountered during API operations.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);
    /**
     * Whether orders have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const ordersLoaded = ref(false);
    /**
     * Whether dispatches have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const dispatchesLoaded = ref(false);
    /**
     * Whether an orders request is in progress.
     * @type {import('vue').Ref<boolean>}
     */
    const ordersLoading = ref(false);
    /**
     * Whether a dispatches request is in progress.
     * @type {import('vue').Ref<boolean>}
     */
    const dispatchesLoading = ref(false);

    /** Number of orders by status / priority. */
    const pendingCount = computed(() => orders.value.filter(o => o.status === ORDER_STATUS.PENDING).length);
    const approvedCount = computed(() => orders.value.filter(o => o.status === ORDER_STATUS.APPROVED).length);
    const underReviewCount = computed(() => orders.value.filter(o => o.status === ORDER_STATUS.UNDER_REVIEW).length);
    const urgentCount = computed(() => orders.value.filter(o => o.priority === 'HIGH').length);

    /** Number of dispatches by status. */
    const inPreparationCount = computed(() => dispatches.value.filter(d => d.status === DISPATCH_STATUS.IN_PREPARATION).length);
    const scheduledCount = computed(() => dispatches.value.filter(d => d.status === DISPATCH_STATUS.SCHEDULED).length);
    const inTransitCount = computed(() => dispatches.value.filter(d => d.status === DISPATCH_STATUS.IN_TRANSIT).length);
    const withIncidentCount = computed(() => dispatches.value.filter(d => d.status === DISPATCH_STATUS.WITH_INCIDENT).length);

    /**
     * Loads orders from infrastructure and updates the application state.
     * Errors from a previous attempt are cleared so a retry does not repeat them.
     * @returns {void}
     */
    function fetchOrders() {
        errors.value = [];
        ordersLoading.value = true;
        orderManagementApi.getOrders().then(response => {
            orders.value = OrderAssembler.toEntitiesFromResponse(response);
            ordersLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => {
            ordersLoading.value = false;
        });
    }

    /**
     * Loads dispatches from infrastructure and updates the application state.
     * Errors from a previous attempt are cleared so a retry does not repeat them.
     * @returns {void}
     */
    function fetchDispatches() {
        errors.value = [];
        dispatchesLoading.value = true;
        orderManagementApi.getDispatches().then(response => {
            dispatches.value = DispatchAssembler.toEntitiesFromResponse(response);
            dispatchesLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => {
            dispatchesLoading.value = false;
        });
    }

    /**
     * Finds an order entity by identifier.
     * @param {number|string} id - Order identifier.
     * @returns {Order|undefined} Matching order, if available.
     */
    function getOrderById(id) {
        return orders.value.find(order => String(order["id"]) === String(id));
    }

    /**
     * Creates an order through infrastructure and appends it to local state.
     * @param {Order} order - Order entity to persist.
     * @returns {void}
     */
    function addOrder(order) {
        orderManagementApi.createOrder(order).then(response => {
            const newOrder = OrderAssembler.toEntityFromResource(response.data);
            orders.value.push(newOrder);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Updates an existing order and synchronizes local state.
     * @param {Order} order - Order entity with updated data.
     * @returns {void}
     */
    function updateOrder(order) {
        orderManagementApi.updateOrder(order).then(response => {
            const updatedOrder = OrderAssembler.toEntityFromResource(response.data);
            const index = orders.value.findIndex(o => o["id"] === updatedOrder.id);
            if (index !== -1) orders.value[index] = updatedOrder;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Deletes an order and removes it from local state.
     * @param {Order} order - Order entity to remove.
     * @returns {void}
     */
    function deleteOrder(order) {
        orderManagementApi.deleteOrder(order.id).then(() => {
            const index = orders.value.findIndex(o => o["id"] === order.id);
            if (index !== -1) orders.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Finds a dispatch entity by identifier.
     * @param {number|string} id - Dispatch identifier.
     * @returns {Dispatch|undefined} Matching dispatch, if available.
     */
    function getDispatchById(id) {
        return dispatches.value.find(dispatch => String(dispatch["id"]) === String(id));
    }

    /**
     * Builds the next sequential dispatch identifier (DS-###).
     * @returns {string} Next dispatch identifier.
     */
    function nextDispatchId() {
        const numbers = dispatches.value.map(d => parseInt(String(d.id).replace(/\D/g, ''))).filter(n => !isNaN(n));
        return `DS-${(numbers.length ? Math.max(...numbers) : 103) + 1}`;
    }

    /**
     * Creates a dispatch through infrastructure and appends it to local state.
     * @param {Dispatch} dispatch - Dispatch entity to persist.
     * @returns {void}
     */
    function addDispatch(dispatch) {
        orderManagementApi.createDispatch(dispatch).then(response => {
            const newDispatch = DispatchAssembler.toEntityFromResource(response.data);
            dispatches.value.push(newDispatch);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Updates an existing dispatch and synchronizes local state.
     * @param {Dispatch} dispatch - Dispatch entity with updated data.
     * @returns {void}
     */
    function updateDispatch(dispatch) {
        orderManagementApi.updateDispatch(dispatch).then(response => {
            const updatedDispatch = DispatchAssembler.toEntityFromResource(response.data);
            const index = dispatches.value.findIndex(d => d["id"] === updatedDispatch.id);
            if (index !== -1) dispatches.value[index] = updatedDispatch;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Deletes a dispatch and removes it from local state.
     * @param {Dispatch} dispatch - Dispatch entity to remove.
     * @returns {void}
     */
    function deleteDispatch(dispatch) {
        orderManagementApi.deleteDispatch(dispatch.id).then(() => {
            const index = dispatches.value.findIndex(d => d["id"] === dispatch.id);
            if (index !== -1) dispatches.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    return {
        orders,
        dispatches,
        errors,
        ordersLoaded,
        dispatchesLoaded,
        ordersLoading,
        dispatchesLoading,
        pendingCount,
        approvedCount,
        underReviewCount,
        urgentCount,
        inPreparationCount,
        scheduledCount,
        inTransitCount,
        withIncidentCount,
        fetchOrders,
        fetchDispatches,
        getOrderById,
        addOrder,
        updateOrder,
        deleteOrder,
        getDispatchById,
        nextDispatchId,
        addDispatch,
        updateDispatch,
        deleteDispatch
    }
});

export default useOrderManagementStore;
