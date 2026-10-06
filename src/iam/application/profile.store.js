/**
 * Application service store for the profile of the active user (IAM bounded context).
 *
 * @module useProfileStore
 */
import {defineStore} from "pinia";
import {ref} from "vue";
import {IamApi} from "../infrastructure/iam-api.js";
import {UserProfileAssembler} from "../infrastructure/user-profile.assembler.js";

const iamApi = new IamApi();

/**
 * Reactive store that loads and saves the profile shown in Settings.
 *
 * @returns {Object} Store state and actions.
 */
const useProfileStore = defineStore('profile', () => {
    /** @type {import('vue').Ref<?import('../domain/user-profile.entity.js').UserProfile>} */
    const profile = ref(null);
    /** Errors of the last request. */
    const errors = ref([]);
    /** Whether a profile request is in progress. */
    const profileLoading = ref(false);
    /** Whether the profile is being saved. */
    const saving = ref(false);

    /**
     * Loads the profile of a user.
     * @param {string} userId - User identifier.
     * @returns {void}
     */
    function fetchProfile(userId) {
        errors.value = [];
        profileLoading.value = true;
        iamApi.getUserById(userId).then(response => {
            profile.value = UserProfileAssembler.toEntityFromResource(response.data);
        }).catch(error => {
            profile.value = null;
            errors.value.push(error);
        }).finally(() => {
            profileLoading.value = false;
        });
    }

    /**
     * Persists the edited profile and replaces the local copy with the saved one.
     * @param {import('../domain/user-profile.entity.js').UserProfile} draft - Edited profile.
     * @returns {Promise<import('../domain/user-profile.entity.js').UserProfile>} Saved profile.
     */
    function saveProfile(draft) {
        errors.value = [];
        saving.value = true;
        return iamApi.updateUser(UserProfileAssembler.toResourceFromEntity(draft)).then(response => {
            profile.value = UserProfileAssembler.toEntityFromResource(response.data);
            return profile.value;
        }).catch(error => {
            errors.value.push(error);
            throw error;
        }).finally(() => {
            saving.value = false;
        });
    }

    return {
        profile,
        errors,
        profileLoading,
        saving,
        fetchProfile,
        saveProfile
    };
});

export default useProfileStore;
