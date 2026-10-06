import {UserProfile} from "../domain/user-profile.entity.js";

/**
 * Maps user resources into profile entities and back.
 *
 * @class UserProfileAssembler
 */
export class UserProfileAssembler {
    /**
     * @param {Object} resource - User resource payload.
     * @returns {UserProfile} Profile entity.
     */
    static toEntityFromResource(resource) {
        return new UserProfile({...resource});
    }

    /**
     * @param {UserProfile} entity - Profile entity.
     * @returns {Object} User resource payload.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            companyId: entity.companyId,
            username: entity.username,
            fullName: entity.fullName.trim(),
            email: entity.email.trim(),
            phone: entity.phone.trim(),
            role: entity.role,
            timezone: entity.timezone
        };
    }
}
