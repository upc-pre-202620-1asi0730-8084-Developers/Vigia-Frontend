/**
 * Application service store for the Activity History bounded context.
 *
 * @module useActivityHistoryStore
 */
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {ActivityHistoryApi} from "../infrastructure/activity-history-api.js";
import {ActivityRecordAssembler} from "../infrastructure/activity-record.assembler.js";

const activityHistoryApi = new ActivityHistoryApi();

/**
 * Reactive store that exposes Activity History queries.
 *
 * @returns {Object} Store state and actions.
 */
const useActivityHistoryStore = defineStore('activityHistory', () => {
    /** @type {import('vue').Ref<import('../domain/model/activity-record.entity.js').ActivityRecord[]>} */
    const records = ref([]);
    /** Errors of the last load attempt. */
    const errors = ref([]);
    /** Whether the records have been loaded from the API. */
    const recordsLoaded = ref(false);
    /** Whether a records request is in progress. */
    const recordsLoading = ref(false);

    /** Records ordered from the most recent event. */
    const sortedRecords = computed(() => [...records.value].sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt)));

    /** Names of the users that appear in the history, alphabetically. */
    const userNames = computed(() => [...new Set(records.value.map(r => r.userName).filter(Boolean))].sort());

    /**
     * Loads activity records from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchRecords() {
        errors.value = [];
        recordsLoading.value = true;
        activityHistoryApi.getActivityRecords().then(response => {
            records.value = ActivityRecordAssembler.toEntitiesFromResponse(response);
            recordsLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => {
            recordsLoading.value = false;
        });
    }

    return {
        records,
        errors,
        recordsLoaded,
        recordsLoading,
        sortedRecords,
        userNames,
        fetchRecords
    };
});

export default useActivityHistoryStore;
