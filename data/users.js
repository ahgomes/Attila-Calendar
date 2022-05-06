const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;

const validate = require('./validate');

module.exports = {
    /**
     * Gets the logged-in user.
     *
     * @async
     *
     * @returns {Promise<Object>} Returns the logged-in user
     *
     * @throws Errors when the there is no user logged-in
     *
     * @todo IMPLEMENT FUNCTION
     */
    async getLoggedinUser() {
        // TODO
        return { username: 'foobar', first_name: 'Foo', last_name: 'Bar' };
    },
};
