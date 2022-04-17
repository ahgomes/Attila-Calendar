const mongoCollections = require('../config/mongoCollections');
const events = mongoCollections.events;

const { ObjectId } = require('mongodb');
const usersApi = require('./users');
const validateApi = require('./validate');
const { get } = require('express/lib/response');

module.exports = {
    /**
     * Finds an event with the given id.
     *
     * @async
     *
     * @param {string} eventId The id of the event
     *
     * @returns {Object} Returns the specified event of the form {_id: ObjectId, owners: Array<'string'>, title: 'string', description: 'string', priority: number, deadline: Date, comments: Subdocument<{_id: ObjectId, owner: 'string', comment: 'string', createdOn: Date}>}
     *
     * @throws Errors when {eventId} is not a string, or is an empty string
     * @throws Errors when {eventId} is an invalid object id
     * @throws Errors when the event cannot be found
     */
    async getEventById(eventId) {
        validateApi.checkNumberOfArgs(arguments.length, 1, 1);

        eventId = validateApi.isValidString(eventId, true);
        const parsed_eventId = validateApi.isValidObjectId(eventId);

        const eventsCollection = await events();
        const event = await eventsCollection.findOne({ _id: parsed_eventId });

        if (!event)
            throw `Error: Could not find an event with id '${eventId}'.`;

        return event;
    },

    /**
     * Creates a new event.
     *
     * @async
     *
     * @param {string} title The title of the event
     * @param {string} description The description of the event
     * @param {number} priority The event's priority from 1-5 inclusive
     * @param {Date} deadline The date of the event's deadline, stored in the UTC format
     *
     * @returns {Object} Returns the created event. See getEventById() for the full event schema
     *
     * @throws Errors when {title} is not a string, or is an empty string
     * @throws Errors when {description} is not a string, or is an empty string
     * @throws Errors when {priority} is not a finite integer in the range 1-5 inclusive
     * @throws Errors when {deadline} is not a date object, or if the date is invalid
     * @throws Errors when the event cannot be created
     */
    async createNewEvent(title, description, priority, deadline) {
        validateApi.checkNumberOfArgs(arguments.length, 4, 4);

        title = validateApi.isValidString(title, false);
        date = validateApi.isValidDate(date);
        description = validateApi.isValidString(description, false);
        priority = validateApi.isValidNumber(priority, true);
        deadline = validateApi.isValidDate(deadline);

        if (priority < 1 || priority > 5)
            throw `Error: Priority '${priority}' must be in the range 1-5 inclusive.`;

        const newEvent = {
            owners: [],
            title,
            description,
            priority,
            deadline,
            comments: [],
        };

        const eventsCollection = await events();
        const insertInfo = await eventsCollection.insertOne(newEvent);

        if (!insertInfo.acknowledged || !insertInfo.insertedId)
            throw `Error: Could not create the event.`;

        return await this.getEventById(insertInfo.insertedId.toString());
    },

    /**
     * Deletes an event with the given id.
     *
     * @async
     *
     * @param {string} eventId The id of the event
     *
     * @returns {Object} Returns the deleted event. See getEventById() for the full event schema
     *
     * @throws Errors when {eventId} is not a string, or is an empty string
     * @throws Errors when {eventId} is an invalid object id
     * @throws Errors when the event cannot be found
     * @throws Errors when the event cannot be deleted
     */
    async deleteEventById(eventId) {
        validateApi.checkNumberOfArgs(arguments.length, 1, 1);

        eventId = validateApi.isValidString(eventId, true);

        const event = await this.getEventById(eventId);

        const eventsCollection = await events();
        const deleteInfo = await eventsCollection.deleteOne({
            _id: event._id,
        });

        if (deleteInfo.deletedCount < 1)
            throw `Error: Could not delete the event with id '${eventId}'.`;

        return event;
    },

    /**
     * Modify an event with the given id.
     *
     * @async
     *
     * @param {string} eventId The id of the event
     * @param {string} title The new title of the event
     * @param {string} description The new description of the event
     * @param {number} priority The new event's priority from 1-5 inclusive
     * @param {Date} deadline The new date of the event's deadline, stored in the UTC format
     *
     * @returns {Object} Returns the edited event. See getEventById() for the full event schema
     *
     * @throws Errors when {eventId} is not a string, or is an empty string
     * @throws Errors when {eventId} is an invalid object id
     * @throws Errors when {title} is not a string, or is an empty string
     * @throws Errors when {description} is not a string, or is an empty string
     * @throws Errors when {priority} is not a finite integer in the range 1-5 inclusive
     * @throws Errors when {deadline} is not a date object, or if the date is invalid
     * @throws Errors when the event cannot be found
     * @throws Errors when the event cannot be replaced
     */
    async editEventById(eventId, title, description, priority, deadline) {
        validateApi.checkNumberOfArgs(arguments.length, 5, 5);

        eventId = validateApi.isValidString(eventId, true);
        title = validateApi.isValidString(title, false);
        date = validateApi.isValidDate(date);
        description = validateApi.isValidString(description, false);
        priority = validateApi.isValidNumber(priority, true);
        deadline = validateApi.isValidDate(deadline);

        if (priority < 1 || priority > 5)
            throw `Error: Priority '${priority}' must be in the range 1-5 inclusive.`;

        const event = await this.getEventById(eventId);

        const modifiedEvent = {
            owners: event.owners,
            title,
            description,
            priority,
            deadline,
            comments: event.comments,
        };

        const eventsCollection = await events();
        const replaceInfo = await eventsCollection.replaceOne(
            {
                _id: event._id,
            },
            modifiedEvent
        );

        if (replaceInfo.modifiedCount < 1)
            throw `Error: Could not replace the event with id '${eventId}'.`;

        return await this.getEventById(event._id.toString());
    },

    /**
     * Adds a user to an event with the given id.
     *
     * @async
     *
     * @param {string} eventId The id of the event
     * @param {string} username The username of the user
     *
     * @returns {void} Returns the edited event after adding the user. See getEventById() for the full event schema
     *
     * @throws Errors when {eventId} is not a string, or is an empty string
     * @throws Errors when {eventId} is an invalid object id
     * @throws Errors when {username} is not a string, or is an empty string
     * @throws Errors when the event cannot be found
     * @throws Errors when the user cannot be added to the event
     */
    async addUserToEvent(eventId, username) {
        validateApi.checkNumberOfArgs(arguments.length, 2, 2);

        eventId = validateApi.isValidString(eventId, true);
        username = validateApi.isValidString(username, true);

        const event = await this.getEventById(eventId);

        const eventsCollection = await events();
        const updateInfo = await eventsCollection.updateOne(
            { _id: event._id },
            { $push: { owners: username } }
        );

        if (updateInfo.modifiedCount < 1)
            throw `Error: Could not add user '${username}' to the event with id '${eventId}'.`;

        return await this.getEventById(event._id.toString());
    },

    /**
     * Removes a user from an event with the given id.
     *
     * @async
     *
     * @param {string} eventId The id of the event
     * @param {string} username The username of the user
     *
     * @returns {void} Returns the edited event after removing the user. See getEventById() for the full event schema
     *
     * @throws Errors when {eventId} is not a string, or is an empty string
     * @throws Errors when {eventId} is an invalid object id
     * @throws Errors when {username} is not a string, or is an empty string
     * @throws Errors when the event cannot be found
     * @throws Errors when the user cannot be removed from the event
     */
    async removeUserFromEvent(eventId, username) {
        validateApi.checkNumberOfArgs(arguments.length, 2, 2);

        eventId = validateApi.isValidString(eventId, true);
        username = validateApi.isValidString(username, true);

        const event = await this.getEventById(eventId);

        const eventsCollection = await events();
        const updateInfo = await eventsCollection.updateOne(
            { _id: event._id },
            { $pull: { owners: username } }
        );

        if (updateInfo.modifiedCount < 1)
            throw `Error: Could not add user '${username}' to the event with id '${eventId}'.`;

        return await this.getEventById(event._id.toString());
    },

    /**
     * Finds a user comment with the given id.
     *
     * @async
     *
     * @param {string} commentId The id of the comment
     *
     * @returns {object} Returns the specified user comment of the form {_id: ObjectId, owner: 'string', comment: 'string', createdOn: Date}
     *
     * @throws Errors when {commentId} is not a string, or is an empty string
     * @throws Errors when {commentId} is an invalid object id
     * @throws Errors when the user comment cannot be found
     */
    async getCommentById(commentId) {
        validateApi.checkNumberOfArgs(arguments.length, 1, 1);

        commentId = validateApi.isValidString(commentId, true);
        const parsed_commentId = validateApi.isValidObjectId(commentId);

        const eventsCollection = await events();
        const event = await eventsCollection.findOne({
            'comments._id': parsed_commentId,
        });

        if (!event)
            throw `Error: Could not find an event containing the user comment with comment id '${commentId}'.`;

        const comment = event.comments.find(
            ({ _id }) => _id.toString() === commentId
        );

        if (!comment)
            throw `Error: Could not find a user comment with id '${commentId}'.`;

        return comment;
    },

    /**
     * Finds the event containing the user comment with the given id.
     *
     * @async
     *
     * @param {string} commentId The id of the comment
     *
     * @returns {object} Returns the specified event. See getEventById() for the full event schema
     *
     * @throws Errors when {commentId} is not a string, or is an empty string
     * @throws Errors when {commentId} is an invalid object id
     * @throws Errors when the event cannot be found
     */
    async getEventFromCommentById(commentId) {
        validateApi.checkNumberOfArgs(arguments.length, 1, 1);

        commentId = validateApi.isValidString(commentId, true);
        const parsed_commentId = validateApi.isValidObjectId(commentId);

        const eventsCollection = await events();
        const event = await eventsCollection.findOne({
            'comments._id': parsed_commentId,
        });

        if (!event)
            throw `Error: Could not find an event containing the user comment with comment id '${commentId}'.`;

        return await this.getEventById(event._id.toString());
    },

    /**
     * Adds a user comment to an event with the given id.
     *
     * @async
     *
     * @param {string} eventId The id of the event
     * @param {string} username The username of the user
     * @param {string} comment The comment of the user
     *
     * @returns {Object} Returns the created user comment. See getCommentById() for the full user comment schema
     *
     * @throws Errors when {eventId} is not a string, or is an empty string
     * @throws Errors when {eventId} is an invalid object id
     * @throws Errors when {username} is not a string, or is an empty string
     * @throws Errors when {comment} is not a string, or is an empty string
     * @throws Errors when the user comment cannot be found
     * @throws Errors when the user comment cannot be added to the event
     */
    async addCommentById(eventId, username, comment) {
        validateApi.checkNumberOfArgs(arguments.length, 3, 3);

        eventId = validateApi.isValidString(eventId, true);
        username = validateApi.isValidString(username, true);
        comment = validateApi.isValidString(comment, false);

        const event = await this.getEventById(eventId);

        if (!event)
            throw `Error: Could not find an event with id '${eventId}'.`;

        const newComment = {
            _id: new ObjectId(),
            owner: username,
            comment: comment,
            createdOn: new Date(),
        };

        const eventsCollection = await events();
        const updateInfo = await eventsCollection.updateOne(
            { _id: event._id },
            { $push: { comments: newComment } }
        );

        if (updateInfo.modifiedCount < 1)
            throw `Error: Could not add the user comment to the event with id '${eventId}'.`;

        return await this.getCommentById(newComment._id.toString());
    },

    /**
     * Deletes a user comment with the given id.
     *
     * @async
     *
     * @param {string} commentId The id of the comment
     *
     * @returns {void} Returns the deleted user comment. See getCommentById() for the full user comment schema
     *
     * @throws Errors when {commentId} is not a string, or is an empty string
     * @throws Errors when {commentId} is an invalid object id
     * @throws Errors when the user comment cannot be found
     * @throws Errors when the user comment cannot be removed from its event
     */
    async deleteCommentById(commentId) {
        validateApi.checkNumberOfArgs(arguments.length, 1, 1);

        commentId = validateApi.isValidString(commentId, true);

        const event = await this.getEventFromCommentById(commentId);
        const comment = await this.getCommentById(commentId);

        const eventsCollection = await events();
        const updateInfo = await eventsCollection.updateOne(
            { _id: event._id },
            { $pull: { comments: comment } }
        );

        if (updateInfo.modifiedCount < 1)
            throw `Error: Could not delete the user comment with id '${commentId}'.`;

        return comment;
    },
};
