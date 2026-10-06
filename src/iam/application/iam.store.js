import {defineStore} from "pinia";
import {ref, computed} from "vue";
import {ROLES} from "../../shared/presentation/navigation.config.js";

/**
 * Store mínimo de autenticación y rol (BC-02 Identity and Access Management)
 * Provee el rol activo para filtrar la navegación global y validar permisos.
 */
export const useIamStore = defineStore('iam', () => {
    // Rol activo por defecto: Responsable de Almacén (quien opera BC-04)
    const currentRole = ref(ROLES.WAREHOUSE_MANAGER);
    const companyId = ref("c0a80101-0000-0000-0000-000000000001");
    const currentUsername = ref("Miguel Rojas");
    // Id del usuario activo en el dataset de usuarios (server/data/iam/users.json)
    const currentUserId = ref("c0a80101-0000-0000-0000-000000000009");
    const isSignedIn = ref(true);

    const testUsers = [
        { userId: "c0a80101-0000-0000-0000-000000000002", name: "María Torres", role: ROLES.ADMIN, label: "roles.ADMIN" },
        { userId: "c0a80101-0000-0000-0000-000000000009", name: "Miguel Rojas", role: ROLES.WAREHOUSE_MANAGER, label: "roles.WAREHOUSE_MANAGER" },
        { userId: "c0a80101-0000-0000-0000-000000000003", name: "Juan Pérez", role: ROLES.SITE_MANAGER, label: "roles.SITE_MANAGER" }
    ];

    function setRole(newRole) {
        currentRole.value = newRole;
        const matched = testUsers.find(u => u.role === newRole);
        if (matched) {
            currentUsername.value = matched.name;
            currentUserId.value = matched.userId;
        }
    }

    return {
        currentRole,
        companyId,
        currentUsername,
        currentUserId,
        isSignedIn,
        testUsers,
        setRole
    };
});

export default useIamStore;