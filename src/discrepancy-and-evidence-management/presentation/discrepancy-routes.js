const IssuesListView = () => import('./views/issues-list-view.vue')
const IssueDetailView = () => import('./views/issue-detail-view.vue')

export const discrepancyRoutes = [
    {
        path: '/problemas',
        name: 'problemas',
        component: IssuesListView,
        meta: {
            title: 'Problemas'
        }
    },
    {
        path: '/problemas/:id',
        name: 'problema-detalle',
        component: IssueDetailView,
        meta: {
            title: 'Detalle del problema'
        }
    }
]