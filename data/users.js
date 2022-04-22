const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;

const validate = require('./validate');

module.exports = {
    /**
     * Gets the logged-in user.
     *
     * @returns {Object} Returns the user in the form {username: 'string', first_name: 'string', last_name: 'string'} if the user is currently logged-in
     *
     * @throws Errors when the there is no user logged-in
     *
     * @todo IMPLEMENT FUNCTION
     */
    getLoggedinUser() {
        // TODO
        return { username: 'foobar', first_name: 'Foo', last_name: 'Bar' };
    },
};
