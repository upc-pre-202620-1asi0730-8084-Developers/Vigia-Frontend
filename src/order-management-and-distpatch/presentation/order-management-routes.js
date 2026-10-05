import { ROLES } from '../../shared/presentation/navigation.config.js';

const OrdersListView = () => import('./views/orders-list-view.vue');
const OrderDetailView = () => import('./views/order-detail-view.vue');
const DispatchesListView = () => import('./views/dispatches-list-view.vue');
const NewDispatchView = () => import('./views/new-dispatch-view.vue');

/**
 * Rutas del Bounded Context BC-05 Ordering and Dispatch.
 * Cubre el flujo del Warehouse Manager: Orders (Solicitudes) y Dispatches (Despachos).
 */
export const orderManagementRoutes = [
    {
        path: '/solicitudes',
        name: 'solicitudes',
        component: OrdersListView,
        meta: { title: 'Solicitudes', roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER] }
    },
    {
        path: '/solicitudes/:id',
        name: 'solicitud-detalle',
        component: OrderDetailView,
        meta: { title: 'Detalle de solicitud', roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER] }
    },
    {
        path: '/despachos',
        name: 'despachos',
        component: DispatchesListView,
        meta: { title: 'Despachos', roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER] }
    },
    {
        path: '/despachos/nuevo',
        name: 'despacho-nuevo',
        component: NewDispatchView,
        meta: { title: 'Nuevo despacho', roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER] }
    }
];
