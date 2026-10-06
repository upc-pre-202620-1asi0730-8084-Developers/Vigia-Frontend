<script setup>
import {useI18n} from "vue-i18n";
import {useToast} from "primevue";
import {computed, reactive, ref, toRefs, watch} from "vue";
import useIamStore from "../../application/iam.store.js";
import useProfileStore from "../../application/profile.store.js";
import {SUPPORTED_TIMEZONES, UserProfile} from "../../domain/user-profile.entity.js";

const {t, locale, availableLocales} = useI18n();
const toast = useToast();
const iamStore = useIamStore();
const profileStore = useProfileStore();
const {profile, profileLoading, saving, errors} = toRefs(profileStore);

const editing = ref(false);
const form = reactive({fullName: '', email: '', phone: ''});
const fieldErrors = reactive({});

const resetForm = () => {
  form.fullName = profile.value?.fullName ?? '';
  form.email = profile.value?.email ?? '';
  form.phone = profile.value?.phone ?? '';
  Object.keys(fieldErrors).forEach(key => delete fieldErrors[key]);
};

// Load the profile of the active user, also when the role selector switches user.
watch(() => iamStore.currentUserId, userId => {
  editing.value = false;
  profileStore.fetchProfile(userId);
}, {immediate: true});
watch(profile, resetForm);

const startEditing = () => {
  resetForm();
  editing.value = true;
};

const cancelEditing = () => {
  resetForm();
  editing.value = false;
};

const saveProfile = () => {
  const draft = new UserProfile({...profile.value, ...form});
  const validation = draft.validate();
  Object.keys(fieldErrors).forEach(key => delete fieldErrors[key]);
  Object.assign(fieldErrors, validation);
  if (Object.keys(validation).length) return;
  profileStore.saveProfile(draft).then(saved => {
    iamStore.currentUsername = saved.fullName;
    editing.value = false;
    toast.add({severity: 'success', summary: t('settings.profile.saved'), life: 3000});
  }).catch(error => toast.add({severity: 'error', summary: t('errors.occurred'), detail: error.message, life: 4000}));
};

const languageOptions = computed(() => availableLocales.map(code => ({label: t(`settings.languages.${code}`), value: code})));
const timezoneOptions = computed(() => SUPPORTED_TIMEZONES.map(zone => ({label: t(`settings.timezones.${zone}`), value: zone})));

const changeTimezone = timezone => {
  if (!profile.value || timezone === profile.value.timezone) return;
  profileStore.saveProfile(new UserProfile({...profile.value, timezone}))
      .then(() => toast.add({severity: 'success', summary: t('settings.preferences.saved'), life: 3000}))
      .catch(error => toast.add({severity: 'error', summary: t('errors.occurred'), detail: error.message, life: 4000}));
};

const roleLabel = computed(() => profile.value ? t(`roles.${profile.value.role}`) : '');
</script>

<template>
  <div class="p-4">
    <h1 class="mb-1">{{ t('settings.title') }}</h1>
    <p class="subtitle mt-0 mb-4">{{ t('settings.subtitle') }}</p>

    <div v-if="errors.length && !profile" class="text-red-500 mb-3">{{ t('settings.profile.loadError') }}</div>

    <div class="grid">
      <div class="col-12 xl:col-8">
        <div class="vigia-card mb-3">
          <div class="card-header">
            <div>
              <h2 class="m-0">{{ t('settings.profile.title') }}</h2>
              <p class="subtitle m-0 mt-1">{{ t('settings.profile.subtitle') }}</p>
            </div>
            <pv-button v-if="!editing" :label="t('settings.profile.edit')" icon="pi pi-pencil" class="btn-secondary"
                       :disabled="!profile" @click="startEditing" />
          </div>

          <div class="profile-body">
            <span class="avatar avatar-lg" aria-hidden="true">{{ profile?.initials }}</span>
            <form class="profile-form" novalidate @submit.prevent="saveProfile">
              <div class="field">
                <label for="profile-name">{{ t('settings.profile.name') }} <span class="required">*</span></label>
                <pv-input-text id="profile-name" v-model="form.fullName" :disabled="!editing || saving" :invalid="!!fieldErrors.fullName" />
                <small v-if="fieldErrors.fullName" class="error-message">{{ t(`settings.validation.${fieldErrors.fullName}`) }}</small>
              </div>
              <div class="field">
                <label for="profile-email">{{ t('settings.profile.email') }} <span class="required">*</span></label>
                <pv-input-text id="profile-email" v-model="form.email" type="email" :disabled="!editing || saving" :invalid="!!fieldErrors.email" />
                <small v-if="fieldErrors.email" class="error-message">{{ t(`settings.validation.${fieldErrors.email}`) }}</small>
              </div>
              <div class="field">
                <label for="profile-role">{{ t('settings.profile.role') }}</label>
                <pv-input-text id="profile-role" :model-value="roleLabel" disabled />
                <small class="subtitle">{{ t('settings.profile.roleHint') }}</small>
              </div>
              <div class="field">
                <label for="profile-phone">{{ t('settings.profile.phone') }}</label>
                <pv-input-text id="profile-phone" v-model="form.phone" type="tel" :disabled="!editing || saving" />
              </div>
              <div v-if="editing" class="form-actions">
                <pv-button type="button" :label="t('settings.profile.cancel')" class="btn-secondary" :disabled="saving" @click="cancelEditing" />
                <pv-button type="submit" :label="t('settings.profile.save')" icon="pi pi-check" class="btn-accent" :loading="saving" />
              </div>
            </form>
          </div>
        </div>

        <div class="vigia-card">
          <h2 class="m-0">{{ t('settings.preferences.title') }}</h2>
          <p class="subtitle m-0 mt-1 mb-3">{{ t('settings.preferences.subtitle') }}</p>
          <div class="preferences">
            <div class="field">
              <label for="preference-language">{{ t('settings.preferences.language') }}</label>
              <pv-select v-model="locale" input-id="preference-language" :options="languageOptions" option-label="label" option-value="value" />
            </div>
            <div class="field">
              <label for="preference-timezone">{{ t('settings.preferences.timezone') }}</label>
              <pv-select :model-value="profile?.timezone" input-id="preference-timezone" :options="timezoneOptions"
                         option-label="label" option-value="value" :disabled="!profile || saving"
                         @update:model-value="changeTimezone" />
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 xl:col-4">
        <div class="vigia-card">
          <h2 class="mt-0 mb-3">{{ t('settings.account.title') }}</h2>
          <div v-if="profileLoading && !profile" class="subtitle">{{ t('common.loading') }}</div>
          <template v-else-if="profile">
            <div class="account-header">
              <span class="avatar" aria-hidden="true">{{ profile.initials }}</span>
              <div>
                <div class="account-name">{{ profile.fullName }}</div>
                <div class="account-role">{{ roleLabel }}</div>
              </div>
            </div>
            <div class="account-box mt-3">
              <i class="pi pi-user" aria-hidden="true" />
              <div>
                <small class="subtitle">{{ t('settings.account.currentRole') }}</small>
                <div class="font-bold">{{ roleLabel }}</div>
              </div>
            </div>
            <div class="account-box mt-2">
              <i class="pi pi-id-card" aria-hidden="true" />
              <div>
                <small class="subtitle">{{ t('settings.account.username') }}</small>
                <div class="font-bold">{{ profile.username }}</div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.subtitle {
  color: var(--color-text-secondary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--sp-16);
  margin-bottom: var(--sp-24);
}

.profile-body {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-24);
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary-light) 18%, var(--color-surface));
}

.avatar-lg {
  width: 120px;
  height: 120px;
  font-size: 2.25rem;
}

.profile-form {
  flex: 1;
  min-width: 16rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: var(--sp-16);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.field label {
  font-weight: 600;
  font-size: 13px;
  color: var(--color-text-main);
}

.required {
  color: var(--color-error);
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: var(--sp-8);
}

.preferences {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: var(--sp-16);
}

.account-header {
  display: flex;
  align-items: center;
  gap: var(--sp-16);
  padding-bottom: var(--sp-16);
  border-bottom: 1px solid var(--p-content-border-color);
}

.account-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.account-role {
  color: var(--color-primary-light);
  font-weight: 500;
}

.account-box {
  display: flex;
  align-items: center;
  gap: var(--sp-16);
  padding: var(--sp-16);
  border-radius: var(--radius-actionable);
  background-color: var(--color-bg);
}

.account-box .pi {
  font-size: 1.25rem;
  color: var(--color-primary);
}
</style>
