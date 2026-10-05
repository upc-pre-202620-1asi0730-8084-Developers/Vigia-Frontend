import {ROLES} from "../../shared/presentation/navigation.config.js";

// Lazy-loaded components
const orderList = () => import('./views/order-list.vue');
const orderDetail = () => import('./views/order-detail.vue');
const dispatchList = () => import('./views/dispatch-list.vue');
const dispatchForm = () => import('./views/dispatch-form.vue');

const roles = [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER];

const orderManagementRoutes = [
    {   path: '/solicitudes',       name: 'ordering-orders',        component: orderList,      meta: {title: 'Solicitudes', roles}},
    {   path: '/solicitudes/:id',   name: 'ordering-order-detail',  component: orderDetail,    meta: {title: 'Detalle de solicitud', roles}},
    {   path: '/despachos',         name: 'ordering-dispatches',    component: dispatchList,   meta: {title: 'Despachos', roles}},
    {   path: '/despachos/nuevo',   name: 'ordering-dispatch-new',  component: dispatchForm,   meta: {title: 'Nuevo despacho', roles}}
];

export default orderManagementRoutes;
