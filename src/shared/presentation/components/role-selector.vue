<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { navigationItems } from '../navigation.config.js';
import useIamStore from '../../../iam/application/iam.store.js';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const iamStore = useIamStore();

// Opciones de perfil de prueba: nombre del usuario y rol traducido
const roleOptions = computed(() => iamStore.testUsers.map(user => ({
  name: user.name,
  roleLabel: t(user.label),
  value: user.role
})));

const selectedOption = computed(() => roleOptions.value.find(option => option.value === iamStore.currentRole));

/**
 * Cambia el rol activo y, si el nuevo rol no puede ver la vista actual,
 * redirige a su primera opción de navegación (igual que el guard del router).
 * @param {{value: string}} event
 */
const onRoleChange = ({ value }) => {
  iamStore.setRole(value);
  const allowedRoles = route.meta?.roles;
  if (Array.isArray(allowedRoles) && !allowedRoles.includes(value)) {
    const firstAllowed = navigationItems.find(item => item.roles.includes(value));
    router.replace(firstAllowed?.path ?? '/inicio');
  }
};
</script>

<template>
  <pv-select
      :model-value="iamStore.currentRole"
      :options="roleOptions"
      option-label="name"
      option-value="value"
      @change="onRoleChange"
  >
    <template #value>
      <span v-if="selectedOption" class="role-value">{{ selectedOption.roleLabel }} · {{ selectedOption.name }}</span>
    </template>
    <template #option="{ option }">
      <div class="role-option">
        <span class="role-option-name">{{ option.name }}</span>
        <small class="role-option-role">{{ option.roleLabel }}</small>
      </div>
    </template>
  </pv-select>
</template>

<style scoped>
.role-value {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.role-option {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.role-option-name {
  font-weight: 600;
  color: var(--color-text-main);
}

.role-option-role {
  color: var(--color-text-secondary);
}
</style>
