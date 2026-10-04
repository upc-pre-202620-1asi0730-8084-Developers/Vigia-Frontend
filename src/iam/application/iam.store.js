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
    const isSignedIn = ref(true);

    const testUsers = [
        { name: "María Torres", role: ROLES.ADMIN, label: "roles.ADMIN" },
        { name: "Miguel Rojas", role: ROLES.WAREHOUSE_MANAGER, label: "roles.WAREHOUSE_MANAGER" },
        { name: "Juan Pérez", role: ROLES.SITE_MANAGER, label: "roles.SITE_MANAGER" }
    ];

    function setRole(newRole) {
        currentRole.value = newRole;
        const matched = testUsers.find(u => u.role === newRole);
        if (matched) {
            currentUsername.value = matched.name;
        }
    }

    return {
        currentRole,
        companyId,
        currentUsername,
        isSignedIn,
        testUsers,
        setRole
    };
});

export default useIamStore;