const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Time zones offered in the preferences. */
export const SUPPORTED_TIMEZONES = ['America/Lima', 'America/Bogota', 'America/Mexico_City', 'America/Santiago'];

/**
 * User profile entity (account data the user can edit in Settings)
 * within the IAM bounded context.
 *
 * @class UserProfile
 */
export class UserProfile {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - User identifier.
     * @param {string} [params.companyId=''] - Company the user belongs to.
     * @param {string} [params.username=''] - Public username.
     * @param {string} [params.fullName=''] - Full name.
     * @param {string} [params.email=''] - Contact email.
     * @param {string} [params.phone=''] - Contact phone.
     * @param {string} [params.role=''] - Role (ROLES).
     * @param {string} [params.timezone='America/Lima'] - Preferred time zone.
     */
    constructor({ id = null, companyId = '', username = '', fullName = '', email = '', phone = '', role = '',
                  timezone = 'America/Lima' }) {
        this.id = id;
        this.companyId = companyId;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.timezone = timezone;
    }

    /** @returns {string} Up to two initials of the full name, for the avatar. */
    get initials() {
        return this.fullName.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0].toUpperCase()).join('');
    }

    /**
     * Validates the editable fields.
     * @returns {Object<string, string>} Error codes by field (empty when valid).
     */
    validate() {
        const errors = {};
        if (!this.fullName.trim()) errors.fullName = 'required';
        if (!this.email.trim()) errors.email = 'required';
        else if (!EMAIL_PATTERN.test(this.email.trim())) errors.email = 'invalidEmail';
        if (!SUPPORTED_TIMEZONES.includes(this.timezone)) errors.timezone = 'required';
        return errors;
    }
}
