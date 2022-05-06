const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;

const validateApi = require('./validate');

module.exports = {
    /**
     * Checks if a user is authorized to view the resource.
     *
     * @param {string} username The username of the user
     * @param {string} owner The username of the owner who is authorized to view the resource
     *
     * @returns {boolean} Returns true if {username} equals {owner}. Otherwise, returns false
     */
    isAuthorized(username, owner) {
        validateApi.checkNumberOfArgs(arguments.length, 2, 2);

        username = validateApi.isValidString(username, true).toLowerCase();
        owner = validateApi.isValidString(owner, true).toLowerCase();

        return owner === username;
    },

    /**
     * Finds a calendar with the given id.
     *
     * @async
     *
     * @param {string} calendarId The id of the calendar
     * @param {string} accesor The username of the user who wants to access the event
     *
     * @returns {Promise<Object>} Returns the specified event of the form {_id: ObjectId, title: 'string', events: Array<ObjectId>}
     *
     * @throws Errors when {calendarId} is not a string, or is an empty string
     * @throws Errors when {calendarId} is an invalid object id
     * @throws Errors when the calendar cannot be found
     * @throws Errors when {accesor} does not have access to {calendarId}
     */
    async getCalendarById(calendarId, accesor) {
        validateApi.checkNumberOfArgs(arguments.length, 2, 2);

        calendarId = validateApi.isValidString(calendarId, true);
        const parsed_calendarId = validateApi.isValidObjectId(calendarId);
        accesor = validateApi.isValidString(accesor, true).toLowerCase();

        const usersCollection = await users();
        const user = await usersCollection.findOne(
            {
                'calendars._id': parsed_calendarId,
            },
            { username: 1, 'calendars.$': 1 }
        );

        if (!user)
            throw `Error: Could not find a calendar with id '${calendarId}'.`;

        if (!isAuthorized(accesor, user.username))
            throw `Error: User '${accesor}' is not authorized to access the calendar with id '${calendarId}'.`;

        return user.calendars;
    },

    /**
     * Adds an event to a calendar with the given id.
     *
     * @async
     *
     * @param {string} calendarId The id of the calendar
     * @param {string} eventId The id of the event
     * @param {string} accesor The username of the user who wants to access the calendar
     *
     * @returns {Promise<Object>} Returns the edited calendar after adding the event.  See getCalendarById() for the full event schema
     *
     * @throws Errors when {calendarId} is not a string, or is an empty string
     * @throws Errors when {calendarId} is an invalid object id
     * @throws Errors when {eventId} is not a string, or is an empty string
     * @throws Errors when {eventId} is an invalid object id
     * @throws Errors when the calendar cannot be found
     * @throws Errors when {accesor} does not have access to {calendarId}
     */
    async addEventById(calendarId, eventId, accesor) {
        validateApi.checkNumberOfArgs(arguments.length, 3, 3);

        calendarId = validateApi.isValidString(calendarId, true);
        eventId = validateApi.isValidString(eventId, true);
        const parsed_eventId = validateApi.isValidObjectId(eventId);
        accesor = validateApi.isValidString(accesor, true).toLowerCase();

        const calendar = await this.getCalendarById(calendarId, accesor);

        const usersCollection = await users();
        const updateInfo = await usersCollection.updateOne(
            { 'calendars._id': calendar._id },
            { $push: { 'calendars.events': parsed_eventId } }
        );

        if (updateInfo.modifiedCount < 1)
            throw `Error: Could not add the event with id '${eventId}' to the calendar with id '${calendarId}'.`;

        return await this.getCalendarById(calendar._id.toString(), accesor);
    },

    /**
     * Removes an event from a calendar with the given id.
     *
     * @async
     *
     * @param {string} calendarId The id of the calendar
     * @param {string} eventId The id of the event
     * @param {string} accesor The username of the user who wants to access the calendar
     *
     * @returns {Promise<Object>} Returns the edited calendar after removing the event.  See getCalendarById() for the full event schema
     *
     * @throws Errors when {calendarId} is not a string, or is an empty string
     * @throws Errors when {calendarId} is an invalid object id
     * @throws Errors when {eventId} is not a string, or is an empty string
     * @throws Errors when {eventId} is an invalid object id
     * @throws Errors when the calendar cannot be found
     * @throws Errors when {accesor} does not have access to {calendarId}
     */ async removeEventById(calendarId, eventId, accesor) {
        validateApi.checkNumberOfArgs(arguments.length, 3, 3);

        calendarId = validateApi.isValidString(calendarId, true);
        eventId = validateApi.isValidString(eventId, true);
        const parsed_eventId = validateApi.isValidObjectId(eventId);
        accesor = validateApi.isValidString(accesor, true).toLowerCase();

        const calendar = await this.getCalendarById(calendarId, accesor);

        const usersCollection = await users();
        const updateInfo = await usersCollection.updateOne(
            { 'calendars._id': calendar._id },
            { $pull: { 'calendars.events': parsed_eventId } }
        );

        if (updateInfo.modifiedCount < 1)
            throw `Error: Could not remove the event with id '${eventId}' to the calendar with id '${calendarId}'.`;

        return await this.getCalendarById(calendar._id.toString(), accesor);
    },
};
