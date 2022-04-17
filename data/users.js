const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;

const validate = require('./validate');

module.exports = {
    /**
     * Gets the logged-in user.
     *
     * @returns {Object} Returns {username: 'string', first_name: 'string', last_name: 'string'} if the user is currently logged-in. Otherwise, returns null
     * @todo IMPLEMENT FUNCTION
     */
    getLoggedinUser() {
        return null;
    },
};
