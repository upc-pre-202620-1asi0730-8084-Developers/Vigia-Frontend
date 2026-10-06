import {ROLES} from "../../shared/presentation/navigation.config.js";

// Lazy-loaded components
const homeView = () => import('./views/home-view.vue');

const dashboardRoutes = [
    {   path: '/inicio',   name: 'home',   component: homeView,   meta: {title: 'Inicio', roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.SITE_MANAGER]}}
];

export default dashboardRoutes;
