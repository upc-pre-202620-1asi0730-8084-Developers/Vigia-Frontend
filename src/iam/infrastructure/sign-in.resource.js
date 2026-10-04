/**
 * Infrastructure resource returned by the authentication endpoint.
 *
 * @class SignInResource
 */
export class SignInResource {
    /**
     * @param {Object} params - Resource payload.
     * @param {string|number} params.id - Authenticated user identifier.
     * @param {string} params.username - Authenticated username.
     * @param {string} params.token - Bearer token.
     */
    constructor({id, username, token}) {
        this.id = id;
        this.username = username;
        this.token = token;
    }
}