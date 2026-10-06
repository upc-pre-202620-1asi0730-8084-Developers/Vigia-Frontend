/**
 * Application service store for the Transit Traceability bounded context.
 * It coordinates route tracking use cases and keeps UI-facing state.
 *
 * @module useTransitTraceabilityStore
 */
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {TransitTraceabilityApi} from "../infrastructure/transit-traceability-api.js";
import {RouteAssembler} from "../infrastructure/route.assembler.js";
import {SIMULATION_MODE, TelemetrySimulator} from "../infrastructure/telemetry-simulator.js";
import {Route} from "../domain/model/route.entity.js";
import {ROUTE_STATUS} from "../domain/route-status.js";

const transitTraceabilityApi = new TransitTraceabilityApi();

/**
 * Reactive store that exposes Transit Traceability commands and queries.
 *
 * @returns {Object} Store state and actions.
 */
const useTransitTraceabilityStore = defineStore('transitTraceability', () => {
    /**
     * List of route entities.
     * @type {import('vue').Ref<Route[]>}
     */
    const routes = ref([]);
    /**
     * List of errors encountered during API or domain operations.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);
    /**
     * Whether routes have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const routesLoaded = ref(false);

    /** Number of routes by status. */
    const activeCount = computed(() => routes.value.filter(r => r.isActive).length);
    const deviatedCount = computed(() => routes.value.filter(r => r.status === ROUTE_STATUS.DEVIATED).length);
    const stoppedCount = computed(() => routes.value.filter(r => r.status === ROUTE_STATUS.STOPPED).length);
    const signalLostCount = computed(() => routes.value.filter(r => r.status === ROUTE_STATUS.SIGNAL_LOST).length);
    /** Number of deviation / stop alerts not yet notified to their destination site. */
    const pendingNotificationsCount = computed(() => routes.value.reduce((total, r) => total + r.pendingNotifications.length, 0));

    /**
     * Loads routes from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchRoutes() {
        transitTraceabilityApi.getRoutes().then(response => {
            routes.value = RouteAssembler.toEntitiesFromResponse(response);
            routesLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Finds a route entity by identifier.
     * @param {number|string} id - Route identifier.
     * @returns {Route|undefined} Matching route, if available.
     */
    function getRouteById(id) {
        return routes.value.find(route => String(route["id"]) === String(id));
    }

    /**
     * Applies a domain command on a copy of the route, persists it and synchronizes local state,
     * so a failed request never leaves the UI with unsaved changes.
     * @param {Route} route - Route to change.
     * @param {function(Route): *} command - Domain command to run on the copy.
     * @returns {Promise<*>} Resolves to the command result once persisted.
     */
    function applyAndPersist(route, command) {
        const draft = RouteAssembler.toEntityFromResource(RouteAssembler.toResourceFromEntity(route));
        let result;
        try {
            result = command(draft);
        } catch (error) {
            errors.value.push(error);
            return Promise.reject(error);
        }
        return transitTraceabilityApi.updateRoute(RouteAssembler.toResourceFromEntity(draft)).then(response => {
            const updatedRoute = RouteAssembler.toEntityFromResource(response.data);
            const index = routes.value.findIndex(r => r["id"] === updatedRoute.id);
            if (index !== -1) routes.value[index] = updatedRoute;
            return result;
        }).catch(error => {
            errors.value.push(error);
            throw error;
        });
    }

    /**
     * Incorporates the next position reported by the GPS telemetry platform (simulated).
     * @param {Route} route - Tracked route.
     * @param {string} [mode=SIMULATION_MODE.ON_ROUTE] - Kind of report to simulate.
     * @returns {Promise<import('../domain/model/transit-alert.entity.js').TransitAlert[]>} Alerts raised by the position.
     */
    function reportPosition(route, mode = SIMULATION_MODE.ON_ROUTE) {
        return applyAndPersist(route, draft => draft.registerPosition(TelemetrySimulator.nextReport(draft, mode)));
    }

    /**
     * Registers that the GPS device of the route stopped reporting (simulated platform event).
     * @param {Route} route - Tracked route.
     * @returns {Promise<import('../domain/model/transit-alert.entity.js').TransitAlert>} Raised alert.
     */
    function reportSignalLost(route) {
        return applyAndPersist(route, draft => draft.reportSignalLost(TelemetrySimulator.nextTimestamp(draft)));
    }

    /**
     * Notifies the destination site about a deviation or prolonged-stop alert.
     * @param {Route} route - Route that raised the alert.
     * @param {string} alertId - Alert identifier.
     * @returns {Promise<import('../domain/model/transit-alert.entity.js').TransitAlert>} Notified alert.
     */
    function notifyDestinationSite(route, alertId) {
        return applyAndPersist(route, draft => draft.notifyDestinationSite(alertId));
    }

    return {
        routes,
        errors,
        routesLoaded,
        activeCount,
        deviatedCount,
        stoppedCount,
        signalLostCount,
        pendingNotificationsCount,
        fetchRoutes,
        getRouteById,
        reportPosition,
        reportSignalLost,
        notifyDestinationSite
    }
});

export default useTransitTraceabilityStore;
