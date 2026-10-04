/**
 * IAM user aggregate root representation used by the client domain model.
 *
 * @class User
 */
export class User {
    /**
     * @param {Object} params - Entity attributes.
     * @param {string|number} params.id - Unique user identifier.
     * @param {string} params.username - Public username.
     */
    constructor({id, username}) {
        this.id = id;
        this.username = username;
    }
}