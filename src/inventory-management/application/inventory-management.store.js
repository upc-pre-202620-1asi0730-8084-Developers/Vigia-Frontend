/**
 * Application service store for the Inventory Management bounded context.
 *
 * @module useInventoryManagementStore
 */
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {InventoryManagementApi} from "../infrastructure/inventory-management-api.js";
import {MaterialAssembler} from "../infrastructure/material.assembler.js";
import {InventoryMovementAssembler} from "../infrastructure/inventory-movement.assembler.js";

const inventoryManagementApi = new InventoryManagementApi();

/**
 * Groups items by a key and sums a value, largest totals first.
 * @template T
 * @param {T[]} items
 * @param {function(T): string} keyOf
 * @param {function(T): number} valueOf
 * @returns {Array<{key: string, total: number, sample: T}>}
 */
function sumBy(items, keyOf, valueOf) {
    const groups = new Map();
    items.forEach(item => {
        const key = keyOf(item);
        const group = groups.get(key) ?? {key, total: 0, sample: item};
        group.total += valueOf(item);
        groups.set(key, group);
    });
    return [...groups.values()].sort((a, b) => b.total - a.total);
}

/**
 * Reactive store that exposes Inventory Management queries.
 *
 * @returns {Object} Store state and actions.
 */
const useInventoryManagementStore = defineStore('inventoryManagement', () => {
    /** @type {import('vue').Ref<import('../domain/model/material.entity.js').Material[]>} */
    const materials = ref([]);
    /** @type {import('vue').Ref<import('../domain/model/inventory-movement.entity.js').InventoryMovement[]>} */
    const movements = ref([]);
    /** Errors of the last load attempt. */
    const errors = ref([]);
    /** Whether the inventory has been loaded from the API. */
    const inventoryLoaded = ref(false);
    /** Whether an inventory request is in progress. */
    const inventoryLoading = ref(false);

    const lowStockCount = computed(() => materials.value.filter(m => m.isLowStock).length);
    const categoriesCount = computed(() => new Set(materials.value.map(m => m.category)).size);

    /** Latest movement date, used as the reference "today" of the dataset. */
    const referenceDate = computed(() => movements.value.reduce((latest, m) => m.date > latest ? m.date : latest, ''));
    const todayMovementsCount = computed(() => movements.value.filter(m => m.date === referenceDate.value).length);

    const outgoing = computed(() => movements.value.filter(m => m.isOutgoing));

    /** Materials with the largest outgoing quantity: { materialId, name, quantity, unit }. */
    const mostUsedMaterials = computed(() => sumBy(outgoing.value, m => m.materialId, m => m.quantity)
        .map(({key, total, sample}) => ({materialId: key, name: sample.materialName, quantity: total, unit: sample.unit})));

    /** Number of outgoing movements per project: { projectId, name, count }. */
    const withdrawalsByProject = computed(() => sumBy(outgoing.value, m => m.projectId, () => 1)
        .map(({key, total, sample}) => ({projectId: key, name: sample.projectName, count: total})));

    /** Number of materials per category: { category, count }. */
    const materialsByCategory = computed(() => sumBy(materials.value, m => m.category, () => 1)
        .map(({key, total}) => ({category: key, count: total})));

    /**
     * Loads materials and movements from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchInventory() {
        errors.value = [];
        inventoryLoading.value = true;
        Promise.all([inventoryManagementApi.getMaterials(), inventoryManagementApi.getMovements()])
            .then(([materialsResponse, movementsResponse]) => {
                materials.value = MaterialAssembler.toEntitiesFromResponse(materialsResponse);
                movements.value = InventoryMovementAssembler.toEntitiesFromResponse(movementsResponse);
                inventoryLoaded.value = true;
            }).catch(error => {
                errors.value.push(error);
            }).finally(() => {
                inventoryLoading.value = false;
            });
    }

    return {
        materials,
        movements,
        errors,
        inventoryLoaded,
        inventoryLoading,
        lowStockCount,
        categoriesCount,
        referenceDate,
        todayMovementsCount,
        mostUsedMaterials,
        withdrawalsByProject,
        materialsByCategory,
        fetchInventory
    };
});

export default useInventoryManagementStore;
