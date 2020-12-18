const UserApi = require("./api");
const UserModel = require("./model");
const Auth = require("./auth/manager");

/**
 * This class manages some basic user functionality. 
 */
class Users {
    constructor() {
        this.auth = new Auth();
    }

    /**
     * Initializes the class with some parts from IJO's core. It registers the users collection and creates the user 
     * api.
     * @param {Object} parts The parts from IJO's core.
     * @param {Database} database The database for IJO.
     * @param {ApiServer} apiServer The api for IJO.
     */
    initialize({database, apiServer} = {}, {auth} = {}) {
        database.register("users", UserModel);
        this.api = new UserApi(apiServer, this);
        this.auth.initialize({auth});
    }

    /**
     * Loads the user collection.
     * @param {Object} parts The parts from IJO's core.
     * @param {Database} database The database for IJO.
     */
    load({database} = {}) {
        this.collection = database.collection("users");
    }

    /**
     * Creates and returns a new user with the given options.
     * @param {Object} options The options for the user. 
     * @param {String} options.username The username of the user.
     * @param {String} options.password The plaintext password of the user.
     * @returns {UserModel} The newly created user.
     */
    create({username, password} = {}) {
        const user = new UserModel({username});
        user.setPassword(password);

        return user;
    }
}

module.exports = Users;