import {createRouter, createWebHashHistory} from "vue-router";
import useIamStore from "./iam/application/iam.store.js";
import { ROLES, navigationItems } from "./shared/presentation/navigation.config.js";
import { discrepancyRoutes } from './discrepancy-and-evidence-management/presentation/discrepancy-routes.js'
import orderManagementRoutes from './order-management-and-distpatch/presentation/order-management-routes.js'
import projectManagementRoutes from './project-management/presentation/project-management-routes.js'
import dashboardRoutes from './dashboard/presentation/dashboard-routes.js'
import settingsRoutes from './iam/presentation/settings-routes.js'
import activityHistoryRoutes from './activity-history/presentation/activity-history-routes.js'
import inventoryManagementRoutes from './inventory-management/presentation/inventory-management-routes.js'

// Vistas
const modulePlaceholder = () => import('./shared/presentation/views/module-placeholder.vue');
const pageNotFound = () => import('./shared/presentation/views/page-not-found.vue');
const transportView = () => import('./fleet-and-device-management/presentation/views/transport-view.vue');
const receptionManagementView = () => import('./site-reception-and-verification/presentation/views/reception-management-view.vue');
const vehicleRegisterForm = () => import('./fleet-and-device-management/presentation/views/vehicle-register-form.vue');
const vehiclePairDeviceForm = () => import('./fleet-and-device-management/presentation/views/vehicle-pair-device-form.vue');
const registerReceptionPage = () => import('./site-reception-and-verification/presentation/views/register-reception-page.vue');
const reportDiscrepancyPage = () => import('./site-reception-and-verification/presentation/views/report-discrepancy-page.vue');

const routes = [

    ...discrepancyRoutes,
    ...orderManagementRoutes,
    ...projectManagementRoutes,
    ...dashboardRoutes,
    ...settingsRoutes,
    ...activityHistoryRoutes,
    ...inventoryManagementRoutes,
    {
        path: '/',
        redirect: '/inicio'
    },
    {
        path: '/transporte',
        name: 'transporte',
        component: transportView,
        meta: { title: 'Transporte y Flota', roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER] }
    },
    {
        path: '/transporte/unidades/nueva',
        name: 'vehicle-new',
        component: vehicleRegisterForm,
        meta: { title: 'Registrar unidad', roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER] }
    },
    {
        path: '/transporte/unidades/:id/gps',
        name: 'vehicle-pair-device',
        component: vehiclePairDeviceForm,
        meta: { title: 'Vincular dispositivo GPS', roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER] }
    },
    {
        path: '/recepciones',
        name: 'recepciones',
        component: receptionManagementView,
        meta: { title: 'Recepciones en Obra', roles: [ROLES.ADMIN, ROLES.SITE_MANAGER] }
    },
    {
        path: '/recepciones/nueva',
        name: 'reception-new',
        component: registerReceptionPage,
        meta: { title: 'Registrar recepción', roles: [ROLES.ADMIN, ROLES.SITE_MANAGER] }
    },
    {
        path: '/recepciones/:id/discrepancia',
        name: 'reception-discrepancy',
        component: reportDiscrepancyPage,
        meta: { title: 'Reportar discrepancia', roles: [ROLES.ADMIN, ROLES.SITE_MANAGER] }
    },

    {
        path: '/reportes',
        name: 'reportes',
        component: modulePlaceholder,
        meta: { title: 'Reportes', roles: [ROLES.ADMIN] }
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