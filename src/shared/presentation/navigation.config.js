/**
 * Configuración declarativa única de la navegación global de Vigía.
 * Cada ítem define su clave, clave i18n, ícono outline de PrimeIcons, ruta y roles permitidos.
 * La barra lateral y barra móvil filtran estrictamente esta lista; nunca muestran opciones sin acceso.
 */

export const ROLES = {
    ADMIN: 'ADMIN',
    WAREHOUSE_MANAGER: 'WAREHOUSE_MANAGER',
    SITE_MANAGER: 'SITE_MANAGER'
};

export const navigationItems = [
    {
        key: 'home',
        labelKey: 'nav.home',
        icon: 'pi pi-home',
        path: '/inicio',
        roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.SITE_MANAGER]
    },
    {
        key: 'sites',
        labelKey: 'nav.sites',
        icon: 'pi pi-building',
        path: '/obras',
        roles: [ROLES.ADMIN, ROLES.SITE_MANAGER]
    },
    {
        key: 'materials',
        labelKey: 'nav.materials',
        icon: 'pi pi-box',
        path: '/materiales',
        roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER]
    },
    {
        key: 'orders',
        labelKey: 'nav.orders',
        icon: 'pi pi-file-edit',
        path: '/solicitudes',
        roles: [ROLES.WAREHOUSE_MANAGER]
    },
    {
        key: 'dispatches',
        labelKey: 'nav.dispatches',
        icon: 'pi pi-send',
        path: '/despachos',
        roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER]
    },
    {
        key: 'transport',
        labelKey: 'nav.transport',
        icon: 'pi pi-truck',
        path: '/transporte',
        roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER]
    },
    {
        key: 'receptions',
        labelKey: 'nav.receptions',
        icon: 'pi pi-inbox',
        path: '/recepciones',
        roles: [ROLES.ADMIN, ROLES.SITE_MANAGER]
    },
    {
        key: 'issues',
        labelKey: 'nav.issues',
        icon: 'pi pi-exclamation-circle',
        path: '/problemas',
        roles: [ROLES.ADMIN, ROLES.SITE_MANAGER]
    },
    {
        key: 'history',
        labelKey: 'nav.history',
        icon: 'pi pi-history',
        path: '/historial',
        roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.SITE_MANAGER]
    },
    {
        key: 'reports',
        labelKey: 'nav.reports',
        icon: 'pi pi-chart-bar',
        path: '/reportes',
        roles: [ROLES.ADMIN]
    },
    {
        key: 'settings',
        labelKey: 'nav.settings',
        icon: 'pi pi-cog',
        path: '/configuracion',
        roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER, ROLES.SITE_MANAGER]
    }
];
