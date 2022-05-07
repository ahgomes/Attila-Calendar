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
     * @param {string} accesor The username of the user who wants to access the calendar
     *
     * @returns {Promise<Object>} Returns the specified calendar of the form {_id: ObjectId, title: 'string', events: Array<ObjectId>}
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
            { 'calendars._id': parsed_calendarId },
            { projection: { username: 1, 'calendars.$': 1 } }
        );

        if (!user)
            throw `Error: Could not find a calendar with id '${calendarId}'.`;

        if (!this.isAuthorized(accesor, user.username))
            throw `Error: User '${accesor}' is not authorized to access the calendar with id '${calendarId}'.`;

        return user.calendars[0];
    },

    /**
     * Returns the user if they have a calendar containing the given event id.
     *
     * @async
     *
     * @param {string} eventId The id of the event
     * @param {string} username The username of the user
     *
     * @returns {Promise<Object>} Returns the specified user
     *
     * @throws Errors when {calendarId} is not a string, or is an empty string
     * @throws Errors when {calendarId} is an invalid object id
     * @throws Errors when no calendars can be found
     */
    async getUserFromEventById(eventId, accesor) {
        validateApi.checkNumberOfArgs(arguments.length, 2, 2);

        eventId = validateApi.isValidString(eventId, true);
        const parsed_eventId = validateApi.isValidObjectId(eventId);
        accesor = validateApi.isValidString(accesor, true).toLowerCase();

        const usersCollection = await users();
        const user = await usersCollection.findOne({
            $and: [
                { username: accesor },
                { 'calendars.events': { $all: [parsed_eventId] } },
            ],
        });

        if (!user)
            throw `Error: User '${accesor}' does not have a calendar with the event id '${eventId}'.`;

        return user;
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
     * @returns {Promise<Object>} Returns the edited calendar after adding the event. See getCalendarById() for the full event schema
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
            { $push: { 'calendars.$.events': parsed_eventId } }
        );

        if (updateInfo.modifiedCount < 1)
            throw `Error: Could not add the event with id '${eventId}' to the calendar with id '${calendarId}'.`;

        return await this.getCalendarById(calendar._id.toString(), accesor);
    },

    /**
     * Removes an event from all calendars with the given id.
     *
     * @async
     *
     * @param {string} eventId The id of the event
     * @param {string} accesor The username of the user who wants to access the calendar
     *
     * @returns {Promise<boolean>} Returns true if the event was successfully removed from all calendars
     *
     * @throws Errors when {eventId} is not a string, or is an empty string
     * @throws Errors when {eventId} is an invalid object id
     * @throws Errors when no calendars can be found
     * @throws Errors when {accesor} does not have a calendar containing {eventId}
     */
    async removeEventById(eventId, accesor) {
        validateApi.checkNumberOfArgs(arguments.length, 2, 2);

        eventId = validateApi.isValidString(eventId, true);
        const parsed_eventId = validateApi.isValidObjectId(eventId);
        accesor = validateApi.isValidString(accesor, true).toLowerCase();

        await this.getUserFromEventById(eventId, accesor);

        const usersCollection = await users();
        const updateInfo = await usersCollection.updateMany(
            { 'calendars.events': { $all: [parsed_eventId] } },
            { $pull: { 'calendars.$[elem].events': parsed_eventId } },
            { arrayFilters: [{ 'elem.events': { $all: [parsed_eventId] } }] }
        );

        if (updateInfo.modifiedCount < 1)
            throw `Error: Could not remove the event with id '${eventId}' from any calendar.`;

        return true;
    },
};
