const usersApi = require('./users');
const eventsApi = require('./events');
const validateApi = require('./validate');

module.exports = {
    users: usersApi,
    events: eventsApi,
    validate: validateApi,
};
