<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Sidebar from './sidebar.vue';
import LanguageSwitcher from './language-switcher.vue';
import RoleSelector from './role-selector.vue';
import FooterContent from './footer-content.vue';
import { navigationItems } from '../navigation.config.js';

const { t } = useI18n();
const route = useRoute();

const currentNav = computed(() => {
  return navigationItems.find(item => route.path.startsWith(item.path)) || { key: 'home', labelKey: 'nav.home', icon: 'pi pi-home' };
});
</script>

<template>
  <div class="vigia-app-layout">
    <pv-toast position="top-right" />
    <pv-confirm-dialog />

    <!-- Barra de navegación global (Desktop Sidebar + Mobile Bottom Bar) -->
    <Sidebar />

    <!-- Área de contenido principal -->
    <div class="vigia-main-area">
      <!-- Topbar con migas de pan (§4.2.5), selector de rol y switcher de idioma -->
      <header class="vigia-topbar">
        <div class="topbar-start">
          <nav class="vigia-breadcrumb" aria-label="Migas de pan">
            <router-link to="/inicio" class="breadcrumb-link">
              <i class="pi pi-home mr-1" aria-hidden="true"></i>
              <span>{{ t('nav.home') }}</span>
            </router-link>
            <span v-if="currentNav.key !== 'home'" class="breadcrumb-divider">/</span>
            <span v-if="currentNav.key !== 'home'" class="breadcrumb-current">
              <i :class="currentNav.icon" class="mr-1" aria-hidden="true"></i>
              {{ t(currentNav.labelKey) }}
            </span>
          </nav>
        </div>
        <div class="topbar-end">
          <div class="role-selector-container">
            <label for="role-select" class="role-label">{{ t('nav.roleSelector') }}</label>
            <RoleSelector id="role-select" class="role-dropdown" />
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <!-- Vista activa -->
      <main class="vigia-content-container">
        <router-view />
      </main>

      <!-- Pie de página compartido de la aplicación Vigía -->
      <FooterContent />
    </div>
  </div>
</template>

<style scoped>
.vigia-app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-bg);
}

.vigia-main-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  min-height: 100vh;
}

/* En Desktop (>960px), desplazar el contenido a la derecha de la sidebar fija de 256px */
@media (min-width: 961px) {
  .vigia-main-area {
    margin-left: 256px;
    width: calc(100% - 256px);
  }
}

/* En Mobile y Tablet (<960px), agregar margen inferior para la barra fija de 64px */
@media (max-width: 960px) {
  .vigia-main-area {
    margin-left: 0;
    width: 100%;
    padding-bottom: 72px; /* Espacio para safe-area y bottom-bar */
  }
}

.vigia-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  padding: 0 var(--sp-24);
  background-color: var(--color-surface);
  border-bottom: 1px solid #E0E0E0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.topbar-start {
  display: flex;
  align-items: center;
}

.vigia-breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--sp-8);
  font-size: 14px;
}

.breadcrumb-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: color var(--transition-default);
}

.breadcrumb-link:hover {
  color: var(--color-primary-light);
  text-decoration: underline;
}

.breadcrumb-divider {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.breadcrumb-current {
  color: var(--color-text-main);
  font-weight: 600;
  display: flex;
  align-items: center;
}

.topbar-end {
  display: flex;
  align-items: center;
  gap: var(--sp-16);
}

.role-selector-container {
  display: flex;
  align-items: center;
  gap: var(--sp-8);
}

.role-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.role-dropdown {
  min-width: 220px;
  font-size: 13px;
}

.vigia-content-container {
  flex: 1;
  padding: var(--sp-24);
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 600px) {
  .vigia-topbar {
    padding: 0 var(--sp-16);
    flex-direction: column;
    height: auto;
    gap: var(--sp-8);
    padding-top: var(--sp-8);
    padding-bottom: var(--sp-8);
  }

  .role-dropdown {
    min-width: 160px;
  }

  .vigia-content-container {
    padding: var(--sp-16);
  }
}
</style>