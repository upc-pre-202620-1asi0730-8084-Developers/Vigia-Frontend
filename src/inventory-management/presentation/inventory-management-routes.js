import {ROLES} from "../../shared/presentation/navigation.config.js";

// Lazy-loaded components
const inventoryOverview = () => import('./views/inventory-overview.vue');

const inventoryManagementRoutes = [
    {   path: '/materiales',   name: 'inventory',   component: inventoryOverview,   meta: {title: 'Materiales', roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER]}}
];

export default inventoryManagementRoutes;
