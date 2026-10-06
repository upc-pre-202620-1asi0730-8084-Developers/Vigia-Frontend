import {createRouter, createWebHashHistory} from "vue-router";
import useIamStore from "./iam/application/iam.store.js";
import { ROLES, navigationItems } from "./shared/presentation/navigation.config.js";
import { discrepancyRoutes } from './discrepancy-and-evidence-management/presentation/discrepancy-routes.js'
import orderManagementRoutes from './order-management-and-distpatch/presentation/order-management-routes.js'
import projectManagementRoutes from './project-management/presentation/project-management-routes.js'
import activityHistoryRoutes from './activity-history/presentation/activity-history-routes.js'
import inventoryManagementRoutes from './inventory-management/presentation/inventory-management-routes.js'

// Vistas
const modulePlaceholder = () => import('./shared/presentation/views/module-placeholder.vue');
const pageNotFound = () => import('./shared/presentation/views/page-not-found.vue');
const transportView = () => import('./fleet-and-device-management/presentation/views/transport-view.vue');
const receptionManagementView = () => import('./site-reception-and-verification/presentation/views/reception-management-view.vue');

const routes = [

    ...discrepancyRoutes,
    ...orderManagementRoutes,
    ...projectManagementRoutes,
    ...activityHistoryRoutes,
    ...inventoryManagementRoutes,
    {
        path: '/',
        redirect: '/transporte'
    },
    {
        path: '/inicio',
        name: 'inicio',
        component: modulePlaceholder,
        meta: { title: 'Inicio', roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.SITE_MANAGER] }
    },
    {
        path: '/transporte',
        name: 'transporte',
        component: transportView,
        meta: { title: 'Transporte y Flota', roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER] }
    },
    {
        path: '/recepciones',
        name: 'recepciones',
        component: receptionManagementView,
        meta: { title: 'Recepciones en Obra', roles: [ROLES.ADMIN, ROLES.SITE_MANAGER] }
    },

    {
        path: '/reportes',
        name: 'reportes',
        component: modulePlaceholder,
        meta: { title: 'Reportes', roles: [ROLES.ADMIN] }
    },
    {
        path: '/configuracion',
        name: 'configuracion',
        component: modulePlaceholder,
        meta: { title: 'Configuración', roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.SITE_MANAGER] }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: pageNotFound,
        meta: { title: 'Página no encontrada' }
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes: routes
});


router.beforeEach((to, from, next) => {
    const iamStore = useIamStore();
    const baseTitle = 'Vigía';
    const pageTitle = to.meta['title'] || 'Plataforma';
    document.title = `${baseTitle} - ${pageTitle}`;

    // Si la ruta define roles permitidos, verificar que el rol activo tenga acceso
    if (to.meta && Array.isArray(to.meta.roles)) {
        if (!to.meta.roles.includes(iamStore.currentRole)) {
            console.warn(`Acceso denegado a ${to.path} para el rol ${iamStore.currentRole}`);
            // Redirigir a una ruta permitida para este rol
            const defaultAllowed = navigationItems.find(item => item.roles.includes(iamStore.currentRole));
            if (defaultAllowed && defaultAllowed.path !== to.path) {
                return next({ path: defaultAllowed.path });
            }
            return next({ path: '/inicio' });
        }
    }

    next();
});

export default router;