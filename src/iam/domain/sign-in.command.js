/**
 * Command used by the IAM application layer to request authentication.
 *
 * @class SignInCommand
 */
export class SignInCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {string} params.username - Username credential.
     * @param {string} params.password - Password credential.
     */
    constructor({username, password}) {
        this.username = username;
        this.password = password;
    }
}