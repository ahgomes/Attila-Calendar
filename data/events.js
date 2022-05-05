const mongoCollections = require('../config/mongoCollections');
const events = mongoCollections.events;

const { ObjectId } = require('mongodb');
const validateApi = require('./validate');

module.exports = {
    /**
     * Checks if a user is authorized to view the resource.
     *
     * @param {string} username The username of the user
     * @param {Array<string>} owners The list of usernames who are authorized to view the resource
     *
     * @returns {boolean} Returns true if {username} exists in the array {owners}. Otherwise, returns false
     */
    isAuthorized(username, owners) {
        validateApi.checkNumberOfArgs(arguments.length, 2, 2);

        username = validateApi.isValidString(username, true).toLowerCase();
        owners = validateApi
            .isValidArrayOfStrings(owners, false, true)
            .map((elem) => elem.toLowerCase());

        return owners.includes(username);
    },

    /**
     * Checks if an event exists with the given id.
     *
     * @async
     *
     * @param {string} eventId The id of the event
     *
     * @returns {Promise<boolean>} Returns true if the event exists. Otherwise, returns false
     *
     * @throws Errors when {eventId} is not a string, or is an empty string
     * @throws Errors when {eventId} is an invalid object id
     */
    async eventExistsById(eventId) {
        validateApi.checkNumberOfArgs(arguments.length, 1, 1);

        eventId = validateApi.isValidString(eventId, true);
        const parsed_eventId = validateApi.isValidObjectId(eventId);

        const eventsCollection = await events();
        const event = await eventsCollection.findOne({ _id: parsed_eventId });

        return event !== null;
    },

    /**
     * Finds an event with the given id.
     *
     * @async
     *
     * @param {string} eventId The id of the event
     * @param {string} accesor The username of the user who wants to access the event
     *
     * @returns {Promise<Object>} Returns the specified event of the form {_id: ObjectId, owners: Array<'string'>, title: 'string', description: 'string', priority: number, deadline: Date, comments: Subdocument<{_id: ObjectId, owner: 'string', comment: 'string', createdOn: Date}>}
     *
     * @throws Errors when {eventId} is not a string, or is an empty string
     * @throws Errors when {eventId} is an invalid object id
     * @throws Errors when the event cannot be found
     * @throws Errors when {accesor} does not have access to {eventId}
     */
    async getEventById(eventId, accesor) {
        validateApi.checkNumberOfArgs(arguments.length, 2, 2);

        eventId = validateApi.isValidString(eventId, true);
        const parsed_eventId = validateApi.isValidObjectId(eventId);
        accesor = validateApi.isValidString(accesor, true).toLowerCase();

        const eventsCollection = await events();
        const event = await eventsCollection.findOne({ _id: parsed_eventId });

        if (!event)
            throw `Error: Could not find an event with id '${eventId}'.`;

        if (!this.isAuthorized(accesor, event.owners))
            throw `Error: User '${accesor}' is not authorized to access the event with id '${eventId}'.`;

        return event;
    },

    /**
     * Creates a new event.
     *
     * @async
     *
     * @param {string} owner The username of the event owner
     * @param {string} title The title of the event
     * @param {string} description The description of the event
     * @param {number} priority The event's priority from 1-5 inclusive
     * @param {Date} deadline The date of the event's deadline, stored in the UTC format
     *
     * @returns {Promise<Object>} Returns the created event. See getEventById() for the full event schema
     *
     * @throws Errors when {title} is not a string, or is an empty string, or is more than 300 characters
     * @throws Errors when {description} is not a string, or is an empty string, or is more than 2000 characters
     * @throws Errors when {priority} is not a finite integer in the range 1-5 inclusive
     * @throws Errors when {deadline} is not a date object, or if the date is invalid
     * @throws Errors when the event cannot be created
     */
    async createNewEvent(owner, title, description, priority, deadline) {
        validateApi.checkNumberOfArgs(arguments.length, 5, 5);

        owner = validateApi.isValidString(owner, true).toLowerCase();
        title = validateApi.isValidString(title, true);
        description = validateApi.isValidString(description, false);
        priority = validateApi.isValidNumber(priority, true);
        deadline = validateApi.isValidDate(deadline);

        if (title.length > 300)
            throw `Error: Title cannot exceed 300 characters. (${title.length} characters detected)`;
        if (description.length > 2000)
            throw `Error: Description cannot exceed 2000 characters. (${description.length} characters detected)`;
        if (priority < 1 || priority > 5)
            throw `Error: Priority '${priority}' must be in the range 1-5 inclusive.`;

        const newEvent = {
            owners: [owner],
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

        return await this.getEventById(insertInfo.insertedId.toString(), owner);
    },

    /**
     * Deletes an event with the given id.
     *
     * @async
     *
     * @param {string} eventId The id of the event
     * @param {string} accesor The username of the user who wants to access the event
     *
     * @returns {Promise<Object>} Returns the deleted event. See getEventById() for the full event schema
     *
     * @throws Errors when {eventId} is not a string, or is an empty string
     * @throws Errors when {eventId} is an invalid object id
     * @throws Errors when the event cannot be found
     * @throws Errors when {accesor} does not have access to {eventId}
     * @throws Errors when the event cannot be deleted
     */
    async deleteEventById(eventId, accesor) {
        validateApi.checkNumberOfArgs(arguments.length, 2, 2);

        eventId = validateApi.isValidString(eventId, true);
        accesor = validateApi.isValidString(accesor, true).toLowerCase();

        const event = await this.getEventById(eventId, accesor);

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
     * @param {string} accesor The username of the user who wants to access the event
     * @param {string} title The new title of the event
     * @param {string} description The new description of the event
     * @param {number} priority The new event's priority from 1-5 inclusive
     * @param {Date} deadline The new date of the event's deadline, stored in the UTC format
     *
     * @returns {Promise<Object>} Returns the edited event. See getEventById() for the full event schema
     *
     * @throws Errors when {eventId} is not a string, or is an empty string
     * @throws Errors when {eventId} is an invalid object id
     * @throws Errors when {title} is not a string, or is an empty string, or is more than 300 characters
     * @throws Errors when {description} is not a string, or is an empty string, or is more than 2000 characters
     * @throws Errors when {priority} is not a finite integer in the range 1-5 inclusive
     * @throws Errors when {deadline} is not a date object, or if the date is invalid
     * @throws Errors when the event cannot be found
     * @throws Errors when {accesor} does not have access to {eventId}
     * @throws Errors when the event cannot be replaced
     */
    async editEventById(
        eventId,
        accesor,
        title,
        description,
        priority,
        deadline
    ) {
        validateApi.checkNumberOfArgs(arguments.length, 6, 6);

        eventId = validateApi.isValidString(eventId, true);
        accesor = validateApi.isValidString(accesor, true).toLowerCase();
        title = validateApi.isValidString(title, true);
        description = validateApi.isValidString(description, false);
        priority = validateApi.isValidNumber(priority, true);
        deadline = validateApi.isValidDate(deadline);

        if (title.length > 300)
            throw `Error: Title cannot exceed 300 characters. (${title.length} characters detected)`;
        if (description.length > 2000)
            throw `Error: Description cannot exceed 2000 characters. (${description.length} characters detected)`;
        if (priority < 1 || priority > 5)
            throw `Error: Priority '${priority}' must be in the range 1-5 inclusive.`;

        const event = await this.getEventById(eventId, accesor);

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

        return await this.getEventById(event._id.toString(), accesor);
    },

    /**
     * Adds a user to an event with the given id.
     *
     * @async
     *
     * @param {string} eventId The id of the event
     * @param {string} username The username of the user
     * @param {string} accesor The username of the user who wants to access the event
     *
     * @returns {Promise<void>} Returns the edited event after adding the user. See getEventById() for the full event schema
     *
     * @throws Errors when {eventId} is not a string, or is an empty string
     * @throws Errors when {eventId} is an invalid object id
     * @throws Errors when {username} is not a string, or is an empty string
     * @throws Errors when the event cannot be found
     * @throws Errors when {accesor} does not have access to {eventId}
     * @throws Errors when the user cannot be added to the event
     */
    async addUserToEvent(eventId, username, accesor) {
        validateApi.checkNumberOfArgs(arguments.length, 3, 3);

        eventId = validateApi.isValidString(eventId, true);
        username = validateApi.isValidString(username, true).toLowerCase();
        accesor = validateApi.isValidString(accesor, true).toLowerCase();

        const event = await this.getEventById(eventId, accesor);

        const eventsCollection = await events();
        const updateInfo = await eventsCollection.updateOne(
            { _id: event._id },
            { $push: { owners: { $each: [username], $sort: 1 } } }
        );

        if (updateInfo.modifiedCount < 1)
            throw `Error: Could not add user '${username}' to the event with id '${eventId}'.`;

        return await this.getEventById(event._id.toString(), accesor);
    },

    /**
     * Removes a user from an event with the given id.
     *
     * @async
     *
     * @param {string} eventId The id of the event
     * @param {string} username The username of the user
     * @param {string} accesor The username of the user who wants to access the event
     *
     * @returns {Promise<void>} Returns the edited event after removing the user. See getEventById() for the full event schema
     *
     * @throws Errors when {eventId} is not a string, or is an empty string
     * @throws Errors when {eventId} is an invalid object id
     * @throws Errors when {username} is not a string, or is an empty string
     * @throws Errors when the event cannot be found
     * @throws Errors when {accesor} does not have access to {eventId}
     * @throws Errors when the user cannot be removed from the event
     */
    async removeUserFromEvent(eventId, username, accesor) {
        validateApi.checkNumberOfArgs(arguments.length, 3, 3);

        eventId = validateApi.isValidString(eventId, true);
        username = validateApi.isValidString(username, true).toLowerCase();
        accesor = validateApi.isValidString(accesor, true).toLowerCase();

        const event = await this.getEventById(eventId, accesor);

        const eventsCollection = await events();
        const updateInfo = await eventsCollection.updateOne(
            { _id: event._id },
            { $pull: { owners: username } }
        );

        if (updateInfo.modifiedCount < 1)
            throw `Error: Could not remove user '${username}' to the event with id '${eventId}'.`;

        return await this.getEventById(event._id.toString(), accesor);
    },

    /**
     * Checks if a comment exists with the given id.
     *
     * @async
     *
     * @param {string} commentId The id of the comment
     *
     * @returns {Promise<boolean>} Returns true if the comment exists. Otherwise, returns false
     *
     * @throws Errors when {commentId} is not a string, or is an empty string
     * @throws Errors when {commentId} is an invalid object id
     */
    async commentExistsById(commentId) {
        validateApi.checkNumberOfArgs(arguments.length, 1, 1);

        commentId = validateApi.isValidString(commentId, true);
        const parsed_commentId = validateApi.isValidObjectId(commentId);

        const eventsCollection = await events();
        const event = await eventsCollection.findOne({
            'comments._id': parsed_commentId,
        });

        if (!event) return false;

        const comment = event.comments.find(
            ({ _id }) => _id.toString() === commentId
        );

        return comment !== null;
    },

    /**
     * Finds a user comment with the given id.
     *
     * @async
     *
     * @param {string} commentId The id of the comment
     * @param {string} accesor The username of the user who wants to access the comment
     *
     * @returns {Promise<Object>} Returns the specified user comment of the form {_id: ObjectId, owner: 'string', comment: 'string', createdOn: Date}
     *
     * @throws Errors when {commentId} is not a string, or is an empty string
     * @throws Errors when {commentId} is an invalid object id
     * @throws Errors when the user comment cannot be found
     * @throws Errors when {accesor} does not have access to the event containing {commentId}
     */
    async getCommentById(commentId, accesor) {
        validateApi.checkNumberOfArgs(arguments.length, 2, 2);

        commentId = validateApi.isValidString(commentId, true);
        const parsed_commentId = validateApi.isValidObjectId(commentId);
        accesor = validateApi.isValidString(accesor, true).toLowerCase();

        const eventsCollection = await events();
        const event = await eventsCollection.findOne({
            'comments._id': parsed_commentId,
        });

        if (!event)
            throw `Error: Could not find an event containing the user comment with comment id '${commentId}'.`;

        if (!this.isAuthorized(accesor, event.owners))
            throw `Error: User '${accesor}' is not authorized to access the event with id '${event._id.toString()}'.`;

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
     * @param {string} accesor The username of the user who wants to access the comment
     *
     * @returns {Promise<Object>} Returns the specified event. See getEventById() for the full event schema
     *
     * @throws Errors when {commentId} is not a string, or is an empty string
     * @throws Errors when {commentId} is an invalid object id
     * @throws Errors when the event cannot be found
     * @throws Errors when {accesor} does not have access to the event containing {commentId}
     */
    async getEventFromCommentById(commentId, accesor) {
        validateApi.checkNumberOfArgs(arguments.length, 2, 2);

        commentId = validateApi.isValidString(commentId, true);
        const parsed_commentId = validateApi.isValidObjectId(commentId);
        accesor = validateApi.isValidString(accesor, true).toLowerCase();

        const eventsCollection = await events();
        const event = await eventsCollection.findOne({
            'comments._id': parsed_commentId,
        });

        if (!event)
            throw `Error: Could not find an event containing the user comment with comment id '${commentId}'.`;

        if (!this.isAuthorized(accesor, event.owners))
            throw `Error: User '${accesor}' is not authorized to access the event with id '${event._id.toString()}'.`;

        return await this.getEventById(event._id.toString(), accesor);
    },

    /**
     * Adds a user comment to an event with the given id.
     *
     * @async
     *
     * @param {string} eventId The id of the event
     * @param {string} username The username of the user
     * @param {string} comment The comment of the user
     * @param {Date} createdOn The comment's creation date
     *
     * @returns {Promise<Object>} Returns the created user comment. See getCommentById() for the full user comment schema
     *
     * @throws Errors when {eventId} is not a string, or is an empty string
     * @throws Errors when {eventId} is an invalid object id
     * @throws Errors when {username} is not a string, or is an empty string
     * @throws Errors when {comment} is not a string, or is an empty string, or is more than 1000 characters
     * @throws Errors when the user comment cannot be found
     * @throws Errors when {username} does not have access to {eventId}
     * @throws Errors when {createdOn} is not a date object, or if the date is invalid
     * @throws Errors when the user comment cannot be added to the event
     */
    async addCommentById(eventId, username, comment, createdOn) {
        validateApi.checkNumberOfArgs(arguments.length, 4, 4);

        eventId = validateApi.isValidString(eventId, true);
        username = validateApi.isValidString(username, true).toLowerCase();
        comment = validateApi.isValidString(comment, false);
        createdOn = validateApi.isValidDate(createdOn);

        if (comment.length > 1000)
            throw `Error: Comment cannot exceed 1000 characters. (${comment.length} characters detected)`;

        const event = await this.getEventById(eventId, username);

        const newComment = {
            _id: new ObjectId(),
            owner: username,
            comment,
            createdOn,
        };

        const eventsCollection = await events();
        const updateInfo = await eventsCollection.updateOne(
            { _id: event._id },
            { $push: { comments: newComment } }
        );

        if (updateInfo.modifiedCount < 1)
            throw `Error: Could not add the user comment to the event with id '${eventId}'.`;

        return await this.getCommentById(newComment._id.toString(), username);
    },

    /**
     * Deletes a user comment with the given id.
     *
     * @async
     *
     * @param {string} commentId The id of the comment
     * @param {string} accesor The username of the user who wants to access the comment
     *
     * @returns {Promise<Object>} Returns the deleted user comment. See getCommentById() for the full user comment schema
     *
     * @throws Errors when {commentId} is not a string, or is an empty string
     * @throws Errors when {commentId} is an invalid object id
     * @throws Errors when the user comment cannot be found
     * @throws Errors when {accesor} does not have access to the event containing {commentId}
     * @throws Errors when {accesor} is not the owner of the user comment
     * @throws Errors when the user comment cannot be removed from its event
     */
    async deleteCommentById(commentId, accesor) {
        validateApi.checkNumberOfArgs(arguments.length, 2, 2);

        commentId = validateApi.isValidString(commentId, true);
        accesor = validateApi.isValidString(accesor, true).toLowerCase();

        const event = await this.getEventFromCommentById(commentId, accesor);
        const comment = await this.getCommentById(commentId, accesor);

        if (accesor !== comment.owner.toLowerCase())
            throw `Error: User '${accesor}' is not authorized to delete the user comment with id '${comment._id.toString()}'.`;

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
