<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { navigationItems } from '../navigation.config.js';
import useIamStore from '../../../iam/application/iam.store.js';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const iamStore = useIamStore();

const moreDialogVisible = ref(false);

// Filtrar ítems declarativos según el rol del usuario autenticado (§4.2.1, §4.2.5)
const allowedItems = computed(() => {
  return navigationItems.filter(item => item.roles.includes(iamStore.currentRole));
});

// En mobile/tablet (<960px): máximo 4 accesos principales + "Más"
const mainMobileItems = computed(() => {
  if (allowedItems.value.length <= 5) {
    return allowedItems.value;
  }
  return allowedItems.value.slice(0, 4);
});

const moreMobileItems = computed(() => {
  if (allowedItems.value.length <= 5) {
    return [];
  }
  return allowedItems.value.slice(4);
});

const navigateFromMore = (path) => {
  moreDialogVisible.value = false;
  router.push(path);
};

// Opciones de rol para el selector interactivo en la barra lateral
const rolesOptions = computed(() => {
  return iamStore.testUsers.map(user => ({
    label: `${t(user.label)} (${user.name})`,
    value: user.role
  }));
});

const onRoleChange = (event) => {
  iamStore.setRole(event.value);
};
</script>

<template>
  <!-- Barra lateral Desktop (>960px, §4.2.5) -->
  <aside class="vigia-sidebar-desktop" aria-label="Navegación principal">
    <div class="sidebar-header">
      <div class="brand-container">
        <i class="pi pi-shield brand-icon" aria-hidden="true"></i>
        <div class="brand-text">
          <span class="brand-title">{{ t('brand.name') }}</span>
          <span class="brand-tagline">Trazza Labs</span>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav" aria-label="Módulos de la aplicación">
      <ul class="nav-list">
        <li v-for="item in allowedItems" :key="item.key" class="nav-item-wrapper">
          <router-link
            :to="item.path"
            class="nav-link"
            active-class="nav-link-active"
            :aria-current="route.path.startsWith(item.path) ? 'page' : undefined"
          >
            <i :class="item.icon" class="nav-icon" aria-hidden="true"></i>
            <span class="nav-label">{{ t(item.labelKey) }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Selector de rol y usuario en la barra lateral (Desktop) -->
    <div class="sidebar-footer">
      <div class="sidebar-user-box">
        <div class="user-avatar-circle">
          <i class="pi pi-user" aria-hidden="true"></i>
        </div>
        <div class="user-text-info">
          <span class="user-fullname">{{ iamStore.currentUsername }}</span>
          <span class="user-role-text">{{ t('roles.' + iamStore.currentRole) }}</span>
        </div>
      </div>

      <div class="sidebar-selector-wrapper">
        <label for="sidebar-role-select" class="sidebar-selector-label">
          <i class="pi pi-sliders-h mr-1" aria-hidden="true"></i>
          {{ t('nav.roleSelector') }}
        </label>
        <pv-select
          id="sidebar-role-select"
          :model-value="iamStore.currentRole"
          :options="rolesOptions"
          option-label="label"
          option-value="value"
          class="sidebar-role-dropdown"
          @change="onRoleChange"
        />
      </div>
    </div>
  </aside>

  <!-- Barra inferior Mobile y Tablet (<960px, §4.2.5) -->
  <nav class="vigia-bottom-bar" aria-label="Navegación móvil">
    <div class="bottom-bar-inner">
      <router-link
        v-for="item in mainMobileItems"
        :key="item.key"
        :to="item.path"
        class="bottom-nav-item"
        active-class="bottom-nav-item-active"
        :aria-current="route.path.startsWith(item.path) ? 'page' : undefined"
      >
        <i :class="item.icon" class="bottom-icon" aria-hidden="true"></i>
        <span class="bottom-label">{{ t(item.labelKey) }}</span>
      </router-link>

      <!-- Botón "Más" si hay elementos excedentes -->
      <button
        v-if="moreMobileItems.length > 0"
        type="button"
        class="bottom-nav-item more-button"
        @click="moreDialogVisible = true"
        aria-haspopup="dialog"
        :aria-expanded="moreDialogVisible"
      >
        <i class="pi pi-ellipsis-h bottom-icon" aria-hidden="true"></i>
        <span class="bottom-label">{{ t('nav.more') }}</span>
      </button>
    </div>
  </nav>

  <!-- Dialog inferior para opciones restantes en Mobile/Tablet (§3.4) -->
  <pv-dialog
    v-model:visible="moreDialogVisible"
    position="bottom"
    :modal="true"
    :header="t('nav.more')"
    class="vigia-more-dialog"
    :style="{ width: '100%', maxWidth: '480px', margin: '0 auto' }"
  >
    <ul class="more-options-list">
      <li v-for="item in moreMobileItems" :key="item.key">
        <button
          type="button"
          class="more-option-btn"
          @click="navigateFromMore(item.path)"
        >
          <i :class="item.icon" class="more-option-icon" aria-hidden="true"></i>
          <span class="more-option-label">{{ t(item.labelKey) }}</span>
          <i class="pi pi-chevron-right more-option-arrow" aria-hidden="true"></i>
        </button>
      </li>
    </ul>

    <!-- Selector de rol en menú móvil para pruebas ágiles -->
    <div class="mobile-role-selector-box">
      <span class="mobile-role-title">
        <i class="pi pi-sliders-h mr-1" aria-hidden="true"></i>
        {{ t('nav.roleSelector') }}
      </span>
      <pv-select
        :model-value="iamStore.currentRole"
        :options="rolesOptions"
        option-label="label"
        option-value="value"
        class="w-full mt-2"
        @change="onRoleChange"
      />
    </div>
  </pv-dialog>
</template>

<style scoped>
/* =========================================================================
   DESKTOP SIDEBAR (>960px)
   ========================================================================= */
.vigia-sidebar-desktop {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 256px;
  background-color: var(--color-primary);
  color: #FFFFFF;
  z-index: 1000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
}

.sidebar-header {
  padding: var(--sp-24) var(--sp-16);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand-container {
  display: flex;
  align-items: center;
  gap: var(--sp-16);
}

.brand-icon {
  font-size: 28px;
  color: var(--color-accent);
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #FFFFFF;
  line-height: 1.2;
}

.brand-tagline {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}

.sidebar-nav {
  flex: 1;
  padding: var(--sp-16) 0;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item-wrapper {
  margin: 2px var(--sp-8);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--sp-16);
  padding: 10px var(--sp-16);
  color: rgba(255, 255, 255, 0.88);
  text-decoration: none;
  border-radius: var(--radius-actionable);
  font-size: 14px;
  font-weight: 500;
  min-height: 44px; /* a11y: área táctil >= 44px */
  transition: background-color var(--transition-default), color var(--transition-default);
}

.nav-link:hover {
  background-color: var(--color-primary-light);
  color: #FFFFFF;
}

.nav-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.nav-link-active {
  background-color: var(--color-primary-light) !important;
  color: #FFFFFF !important;
  font-weight: 700;
  box-shadow: inset 4px 0 0 var(--color-accent);
}

.nav-icon {
  font-size: 18px;
  width: 20px;
  text-align: center;
}

.nav-label {
  flex: 1;
}

/* =========================================================================
   BOTTOM BAR MOBILE & TABLET (<960px)
   ========================================================================= */
.vigia-bottom-bar {
  display: none; /* Oculto por defecto en desktop */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background-color: var(--color-primary);
  color: #FFFFFF;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.bottom-bar-inner {
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: space-around;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  min-height: 48px;
  min-width: 48px; /* a11y >= 44px */
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 2px;
  transition: background-color var(--transition-default), color var(--transition-default);
}

.bottom-nav-item:hover,
.bottom-nav-item:focus {
  color: #FFFFFF;
}

.bottom-nav-item-active {
  color: var(--color-accent) !important;
  font-weight: 700;
}

.bottom-icon {
  font-size: 18px;
  margin-bottom: 2px;
}

.bottom-label {
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 68px;
}

/* =========================================================================
   MORE DIALOG (Mobile/Tablet)
   ========================================================================= */
.more-options-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.more-option-btn {
  display: flex;
  align-items: center;
  gap: var(--sp-16);
  width: 100%;
  padding: var(--sp-16);
  background: transparent;
  border: none;
  border-bottom: 1px solid #EEEEEE;
  color: var(--color-text-main);
  font-size: 15px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  min-height: 48px;
  border-radius: var(--radius-actionable);
  transition: background-color var(--transition-default);
}

.more-option-btn:hover {
  background-color: #F0F4F8;
  color: var(--color-primary);
}

.more-option-icon {
  font-size: 18px;
  color: var(--color-primary);
  width: 24px;
}

.more-option-label {
  flex: 1;
}

.more-option-arrow {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.mobile-role-selector-box {
  margin-top: var(--sp-16);
  padding-top: var(--sp-16);
  border-top: 1px solid #E0E0E0;
}

.mobile-role-title {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: var(--sp-8);
}

/* =========================================================================
   SIDEBAR FOOTER & ROLE SELECTOR (Desktop)
   ========================================================================= */
.sidebar-footer {
  margin-top: auto;
  padding: var(--sp-16);
  background-color: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: var(--sp-12);
}

.sidebar-user-box {
  display: flex;
  align-items: center;
  gap: var(--sp-12);
}

.user-avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--color-primary-light);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.user-text-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-fullname {
  font-size: 13px;
  font-weight: 600;
  color: #FFFFFF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role-text {
  font-size: 11px;
  color: var(--color-accent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-selector-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-selector-label {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
}

.sidebar-role-dropdown {
  width: 100%;
  font-size: 12px;
}

/* =========================================================================
   RESPONSIVE DISPLAY TOGGLE (§4.1.2)
   ========================================================================= */
@media (max-width: 960px) {
  .vigia-sidebar-desktop {
    display: none;
  }
  .vigia-bottom-bar {
    display: flex;
  }
}

@media (min-width: 961px) {
  .vigia-sidebar-desktop {
    display: flex;
  }
  .vigia-bottom-bar {
    display: none;
  }
}
</style>
