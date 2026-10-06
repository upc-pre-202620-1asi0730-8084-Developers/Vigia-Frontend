import {ROLES} from "../../shared/presentation/navigation.config.js";

// Lazy-loaded components
const settingsView = () => import('./views/settings-view.vue');

const settingsRoutes = [
    {   path: '/configuracion',   name: 'settings',   component: settingsView,   meta: {title: 'Configuración', roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.SITE_MANAGER]}}
];

export default settingsRoutes;
