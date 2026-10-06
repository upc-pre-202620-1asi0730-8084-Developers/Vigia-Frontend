<script setup>
import { computed } from 'vue';
import useIamStore from '../../../iam/application/iam.store.js';
import { ROLES } from '../../../shared/presentation/navigation.config.js';
import HomeHeader from '../components/home-header.vue';
import SupervisorHome from '../components/supervisor-home.vue';
import WarehouseHome from '../components/warehouse-home.vue';
import SiteHome from '../components/site-home.vue';

/**
 * Home: a dashboard for the active role, built from the other bounded contexts' stores.
 */
const iamStore = useIamStore();

const ROLE_HOMES = {
  [ROLES.ADMIN]: SupervisorHome,
  [ROLES.WAREHOUSE_MANAGER]: WarehouseHome,
  [ROLES.SITE_MANAGER]: SiteHome
};

const roleHome = computed(() => ROLE_HOMES[iamStore.currentRole] ?? SupervisorHome);
</script>

<template>
  <div class="p-4">
    <HomeHeader />
    <component :is="roleHome" :key="iamStore.currentRole" />
  </div>
</template>
