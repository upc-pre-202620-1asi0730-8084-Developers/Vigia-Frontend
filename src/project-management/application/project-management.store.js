/**
 * Application service store for the Project Management bounded context.
 *
 * @module useProjectManagementStore
 */
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {ProjectManagementApi} from "../infrastructure/project-management-api.js";
import {ProjectAssembler} from "../infrastructure/project.assembler.js";
import {PROJECT_STATUS} from "../domain/project-status.js";

const projectManagementApi = new ProjectManagementApi();

/**
 * Reactive store that exposes Project Management queries.
 *
 * @returns {Object} Store state and actions.
 */
const useProjectManagementStore = defineStore('projectManagement', () => {
    /**
     * List of project entities.
     * @type {import('vue').Ref<import('../domain/model/project.entity.js').Project[]>}
     */
    const projects = ref([]);
    /**
     * Errors of the last load attempt.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);
    /** Whether projects have been loaded from the API. */
    const projectsLoaded = ref(false);
    /** Whether a projects request is in progress. */
    const projectsLoading = ref(false);

    /** Number of projects by status. */
    const activeCount = computed(() => projects.value.length);
    const atRiskCount = computed(() => projects.value.filter(p => p.status === PROJECT_STATUS.AT_RISK).length);
    const inProgressCount = computed(() => projects.value.filter(p => p.status === PROJECT_STATUS.IN_PROGRESS).length);
    const delayedCount = computed(() => projects.value.filter(p => p.status === PROJECT_STATUS.DELAYED).length);

    /**
     * Number of projects per zone, largest first.
     * @type {import('vue').ComputedRef<Array<{zone: string, count: number}>>}
     */
    const projectsByZone = computed(() => {
        const counts = projects.value.reduce((acc, p) => ({...acc, [p.zone]: (acc[p.zone] || 0) + 1}), {});
        return Object.entries(counts).map(([zone, count]) => ({zone, count})).sort((a, b) => b.count - a.count);
    });

    /**
     * Loads projects from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchProjects() {
        errors.value = [];
        projectsLoading.value = true;
        projectManagementApi.getProjects().then(response => {
            projects.value = ProjectAssembler.toEntitiesFromResponse(response);
            projectsLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => {
            projectsLoading.value = false;
        });
    }

    return {
        projects,
        errors,
        projectsLoaded,
        projectsLoading,
        activeCount,
        atRiskCount,
        inProgressCount,
        delayedCount,
        projectsByZone,
        fetchProjects
    };
});

export default useProjectManagementStore;
