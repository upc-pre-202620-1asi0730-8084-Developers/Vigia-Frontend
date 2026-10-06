import {ROLES} from "../../shared/presentation/navigation.config.js";

// Lazy-loaded components
const activityLog = () => import('./views/activity-log.vue');

const activityHistoryRoutes = [
    {   path: '/historial',   name: 'history',   component: activityLog,   meta: {title: 'Historial', roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.SITE_MANAGER]}}
];

export default activityHistoryRoutes;
