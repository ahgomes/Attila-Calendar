const express = require('express');
const router = express.Router();
const xss = require('xss');

const data = require('../data');
const usersApi = data.usersApi;
const eventsApi = data.eventsApi;
const convertApi = data.convertApi;
const validateApi = data.validateApi;
const eventQuerying = data.eventQuerying;

/* /events */

router.route('/').get((req, res) => {
    return res.render('events/main', {
        title: 'Events Page',
    });
});

/* MY CODE /events/search */
router.route('/search').post((req, res) => {
    try {
        eventSearch = req.body
        eventQuerying = await eventQuerying.listUserEvents(eventSearch.searchTerm)
        res.status(200).render('events/searchEvents', {title: "Events Found", eventSearch: eventSearch.searchTerm, events: eventQuerying})
    } catch (e) {
        res.status(500).send(e)
    }
});


/* /events/create */

router.route('/create').get((req, res) => {
    const titleView = { value: '', noError: true };
    const descView = { value: '', noError: true };
    const priorityView = { value: '', noError: true };
    const dateView = { value: '', noError: true };
    const timeView = { value: '', noError: true };

    return res.render('events/create', {
        title: 'Create an Event',
        scriptSource: '/public/js/events/createEvent.js',
        titleView,
        descView,
        priorityView,
        dateView,
        timeView,
    });
});

router.route('/create').post(async (req, res) => {
    let { input_title, input_desc, input_priority, input_date, input_time } =
        req.body;

    const titleView = {
        value: xss(input_title),
        noError: true,
        errorMsg: null,
    };
    const descView = {
        value: xss(input_desc),
        noError: true,
        errorMsg: null,
    };
    const priorityView = {
        value: xss(input_priority),
        noError: true,
        errorMsg: null,
    };
    const dateView = {
        value: xss(input_date),
        noError: true,
        errorMsg: null,
    };
    const timeView = {
        value: xss(input_time),
        noError: true,
        errorMsg: null,
    };

    let owner = null,
        dateObj = null,
        timeObj = null,
        deadline = null,
        event = null;

    try {
        owner = validateApi
            .isValidString(usersApi.getLoggedinUser().username, true)
            .toLowerCase();
    } catch (e) {
        return res.status(401).render('other/error', {
            title: 'Unexpected Error: (401)',
            errorMsg: e,
        });
    }

    try {
        input_title = validateApi.isValidString(titleView.value, true);
    } catch (e) {
        titleView.noError = false;
        titleView.errorMsg = e;
    }

    try {
        input_desc = validateApi.isValidString(descView.value, false);
    } catch (e) {
        descView.noError = false;
        descView.errorMsg = e;
    }

    try {
        input_priority = validateApi.isValidNumber(
            convertApi.stringToNumber(priorityView.value),
            true
        );
        if (input_priority < 1 || input_priority > 5)
            throw `Error: Priority '${input_priority}' must be in the range 1-5 inclusive.`;
    } catch (e) {
        priorityView.noError = false;
        priorityView.errorMsg = e;
    }

    try {
        dateObj = convertApi.dateStringToObject(dateView.value);
    } catch (e) {
        dateView.noError = false;
        dateView.errorMsg = e;
    }

    try {
        timeObj = convertApi.timeStringToObject(timeView.value);
    } catch (e) {
        timeView.noError = false;
        timeView.errorMsg = e;
    }

    if (
        !titleView.noError ||
        !descView.noError ||
        !priorityView.noError ||
        !dateView.noError ||
        !timeView.noError
    )
        return res.status(400).render('events/create', {
            title: 'Create an Event',
            scriptSource: '/public/js/events/createEvent.js',
            titleView,
            descView,
            priorityView,
            dateView,
            timeView,
        });

    try {
        deadline = validateApi.isValidDate(
            convertApi.stringToDate(dateObj.value, timeObj.value)
        );
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    try {
        event = await eventsApi.createNewEvent(
            owner,
            input_title,
            input_desc,
            input_priority,
            deadline
        );
    } catch (e) {
        return res.status(500).render('other/error', {
            title: 'Unexpected Error: (500)',
            errorMsg: e,
        });
    }

    return res.redirect(`/events/view/${event._id.toString()}`);
});

/* /events/edit/{eventId} */

router.route('/edit/:eventId').get(async (req, res) => {
    let eventId = null,
        accesor = null,
        event = null,
        date_str = null,
        time_str = null;

    try {
        eventId = validateApi.isValidString(xss(req.params.eventId), true);
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    try {
        accesor = validateApi
            .isValidString(usersApi.getLoggedinUser().username, true)
            .toLowerCase();
    } catch (e) {
        return res.status(401).render('other/error', {
            title: 'Unexpected Error: (401)',
            errorMsg: e,
        });
    }

    try {
        const eventExists = await eventsApi.eventExistsById(eventId);
        if (!eventExists)
            return res.status(404).render('other/error', {
                title: 'Unexpected Error: (404)',
                errorMsg: `Error: Could not find an event with id '${eventId}'.`,
            });
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    try {
        event = await eventsApi.getEventById(eventId, accesor);
    } catch (e) {
        return res.status(403).render('other/error', {
            title: 'Unexpected Error: (403)',
            errorMsg: e,
        });
    }

    try {
        event.deadline = validateApi.isValidDate(new Date(event.deadline));
        date_str = convertApi.dateToDateString(event.deadline);
        time_str = convertApi.dateToTimeString(event.deadline);
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    const titleView = { value: event.title, noError: true };
    const descView = { value: event.description, noError: true };
    const priorityView = { value: event.priority, noError: true };
    const dateView = { value: date_str, noError: true };
    const timeView = { value: time_str, noError: true };

    return res.render('events/editEvent', {
        title: 'Edit an Event',
        scriptSource: '/public/js/events/editEvent.js',
        eventId,
        titleView,
        descView,
        priorityView,
        dateView,
        timeView,
    });
});

router.route('/edit/:eventId').put(async (req, res) => {
    let eventId = null,
        accesor = null;

    try {
        eventId = validateApi.isValidString(xss(req.params.eventId), true);
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    try {
        accesor = validateApi
            .isValidString(usersApi.getLoggedinUser().username, true)
            .toLowerCase();
    } catch (e) {
        return res.status(401).render('other/error', {
            title: 'Unexpected Error: (401)',
            errorMsg: e,
        });
    }

    try {
        const eventExists = await eventsApi.eventExistsById(eventId);
        if (!eventExists)
            return res.status(404).render('other/error', {
                title: 'Unexpected Error: (404)',
                errorMsg: `Error: Could not find an event with id '${eventId}'.`,
            });
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    try {
        await eventsApi.getEventById(eventId, accesor);
    } catch (e) {
        return res.status(403).render('other/error', {
            title: 'Unexpected Error: (403)',
            errorMsg: e,
        });
    }

    let { input_title, input_desc, input_priority, input_date, input_time } =
        req.body;

    const titleView = {
        value: xss(input_title),
        noError: true,
        errorMsg: null,
    };
    const descView = {
        value: xss(input_desc),
        noError: true,
        errorMsg: null,
    };
    const priorityView = {
        value: xss(input_priority),
        noError: true,
        errorMsg: null,
    };
    const dateView = {
        value: xss(input_date),
        noError: true,
        errorMsg: null,
    };
    const timeView = {
        value: xss(input_time),
        noError: true,
        errorMsg: null,
    };

    let dateObj = null,
        timeObj = null,
        deadline = null,
        event = null;

    try {
        input_title = validateApi.isValidString(titleView.value, true);
    } catch (e) {
        titleView.noError = false;
        titleView.errorMsg = e;
    }

    try {
        input_desc = validateApi.isValidString(descView.value, false);
    } catch (e) {
        descView.noError = false;
        descView.errorMsg = e;
    }

    try {
        input_priority = validateApi.isValidNumber(
            convertApi.stringToNumber(priorityView.value),
            true
        );
        if (input_priority < 1 || input_priority > 5)
            throw `Error: Priority '${input_priority}' must be in the range 1-5 inclusive.`;
    } catch (e) {
        priorityView.noError = false;
        priorityView.errorMsg = e;
    }

    try {
        dateObj = convertApi.dateStringToObject(dateView.value);
    } catch (e) {
        dateView.noError = false;
        dateView.errorMsg = e;
    }

    try {
        timeObj = convertApi.timeStringToObject(timeView.value);
    } catch (e) {
        timeView.noError = false;
        timeView.errorMsg = e;
    }

    if (
        !titleView.noError ||
        !descView.noError ||
        !priorityView.noError ||
        !dateView.noError ||
        !timeView.noError
    )
        return res.status(400).render('events/editEvent', {
            title: 'Edit an Event',
            scriptSource: '/public/js/events/editEvent.js',
            titleView,
            descView,
            priorityView,
            dateView,
            timeView,
        });

    try {
        deadline = validateApi.isValidDate(
            convertApi.stringToDate(dateObj.value, timeObj.value)
        );
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    try {
        event = await eventsApi.editEventById(
            eventId,
            accesor,
            input_title,
            input_desc,
            input_priority,
            deadline
        );
    } catch (e) {
        return res.status(500).render('other/error', {
            title: 'Unexpected Error: (500)',
            errorMsg: e,
        });
    }

    return res.redirect(`/events/view/${event._id.toString()}`);
});

/* /events/view/{eventId} */

router.route('/view/:eventId').get(async (req, res) => {
    let eventId = null,
        accesor = null,
        event = null;

    try {
        eventId = validateApi.isValidString(xss(req.params.eventId), true);
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    try {
        accesor = validateApi
            .isValidString(usersApi.getLoggedinUser().username, true)
            .toLowerCase();
    } catch (e) {
        return res.status(401).render('other/error', {
            title: 'Unexpected Error: (401)',
            errorMsg: e,
        });
    }

    try {
        const eventExists = await eventsApi.eventExistsById(eventId);
        if (!eventExists)
            return res.status(404).render('other/error', {
                title: 'Unexpected Error: (404)',
                errorMsg: `Error: Could not find an event with id '${eventId}'.`,
            });
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    try {
        event = await eventsApi.getEventById(eventId, accesor);
    } catch (e) {
        return res.status(403).render('other/error', {
            title: 'Unexpected Error: (403)',
            errorMsg: e,
        });
    }

    try {
        event = convertApi.prettifyEvent(event, false, accesor);
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    return res.render('events/view', {
        title: 'View an Event',
        titleExists: event.title.trim().length > 0,
        descExists: event.description.trim().length > 0,
        noCommentsExist: !event.comments.length,
        showView: false,
        showEdit: true,
        showDelete: true,
        event,
    });
});

/* /events/edit/{eventId}/comments */

router.route('/edit/:eventId/comments').get(async (req, res) => {
    let eventId = null,
        accesor = null,
        event = null;

    try {
        eventId = validateApi.isValidString(xss(req.params.eventId), true);
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    try {
        accesor = validateApi
            .isValidString(usersApi.getLoggedinUser().username, true)
            .toLowerCase();
    } catch (e) {
        return res.status(401).render('other/error', {
            title: 'Unexpected Error: (401)',
            errorMsg: e,
        });
    }

    try {
        const eventExists = await eventsApi.eventExistsById(eventId);
        if (!eventExists)
            return res.status(404).render('other/error', {
                title: 'Unexpected Error: (404)',
                errorMsg: `Error: Could not find an event with id '${eventId}'.`,
            });
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    try {
        event = await eventsApi.getEventById(eventId, accesor);
    } catch (e) {
        return res.status(403).render('other/error', {
            title: 'Unexpected Error: (403)',
            errorMsg: e,
        });
    }

    try {
        event = convertApi.prettifyEvent(event, true, accesor);
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    return res.render('events/editComments', {
        title: "Edit an Event's Comments",
        scriptSource: '/public/js/events/editComment.js',
        commentView: { value: '', noError: true },
        noCommentsExist: !event.comments.length,
        event,
    });
});

router.route('/edit/:eventId/comments').post(async (req, res) => {
    let eventId = null,
        username = null,
        comment = null,
        createdOn = null;

    try {
        eventId = validateApi.isValidString(xss(req.params.eventId), true);
    } catch (e) {
        return res.status(400).json({ errorMsg: e });
    }

    try {
        username = validateApi
            .isValidString(usersApi.getLoggedinUser().username, true)
            .toLowerCase();
    } catch (e) {
        return res.status(401).json({ errorMsg: e });
    }

    try {
        const eventExists = await eventsApi.eventExistsById(eventId);
        if (!eventExists)
            return res.status(404).json({
                errorMsg: `Error: Could not find an event with id '${eventId}'.`,
            });
    } catch (e) {
        return res.status(400).json({ errorMsg: e });
    }

    try {
        await eventsApi.getEventById(eventId, username);
    } catch (e) {
        return res.status(403).json({ errorMsg: e });
    }

    let { input_comment } = req.body;

    try {
        input_comment = validateApi.isValidString(xss(input_comment), false);
        createdOn = validateApi.isValidDate(new Date());
    } catch (e) {
        return res.status(400).json({ errorMsg: e });
    }

    try {
        comment = await eventsApi.addCommentById(
            eventId,
            username,
            input_comment,
            createdOn
        );
    } catch (e) {
        return res.status(500).json({ errorMsg: e });
    }

    try {
        comment = convertApi.prettifyComment(comment, true, username);
    } catch (e) {
        return res.status(400).json({ errorMsg: e });
    }

    return res.render('partials/commentWidget', {
        layout: null,
        params: comment,
    });
});

/* /events/delete/{eventId} */

router.route('/delete/:eventId').get(async (req, res) => {
    let eventId = null,
        accesor = null,
        event = null;

    try {
        eventId = validateApi.isValidString(xss(req.params.eventId), true);
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    try {
        accesor = validateApi
            .isValidString(usersApi.getLoggedinUser().username, true)
            .toLowerCase();
    } catch (e) {
        return res.status(401).render('other/error', {
            title: 'Unexpected Error: (401)',
            errorMsg: e,
        });
    }

    try {
        const eventExists = await eventsApi.eventExistsById(eventId);
        if (!eventExists)
            return res.status(404).render('other/error', {
                title: 'Unexpected Error: (404)',
                errorMsg: `Error: Could not find an event with id '${eventId}'.`,
            });
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    try {
        event = await eventsApi.getEventById(eventId, accesor);
    } catch (e) {
        return res.status(403).render('other/error', {
            title: 'Unexpected Error: (403)',
            errorMsg: e,
        });
    }

    try {
        event = convertApi.prettifyEvent(event, false, accesor);
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    return res.render('events/deleteEvent', {
        title: 'Delete an Event',
        titleExists: event.title.trim().length > 0,
        descExists: event.description.trim().length > 0,
        noCommentsExist: !event.comments.length,
        showView: false,
        showEdit: false,
        showDelete: false,
        event,
    });
});

router.route('/delete/:eventId').delete(async (req, res) => {
    let eventId = null,
        accesor = null;

    try {
        eventId = validateApi.isValidString(xss(req.params.eventId), true);
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    try {
        accesor = validateApi
            .isValidString(usersApi.getLoggedinUser().username, true)
            .toLowerCase();
    } catch (e) {
        return res.status(401).render('other/error', {
            title: 'Unexpected Error: (401)',
            errorMsg: e,
        });
    }

    try {
        const eventExists = await eventsApi.eventExistsById(eventId);
        if (!eventExists)
            return res.status(404).render('other/error', {
                title: 'Unexpected Error: (404)',
                errorMsg: `Error: Could not find an event with id '${eventId}'.`,
            });
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    try {
        await eventsApi.getEventById(eventId, accesor);
    } catch (e) {
        return res.status(403).render('other/error', {
            title: 'Unexpected Error: (403)',
            errorMsg: e,
        });
    }

    try {
        await eventsApi.deleteEventById(eventId, accesor);
    } catch (e) {
        return res.status(500).render('other/error', {
            title: 'Unexpected Error: (500)',
            errorMsg: e,
        });
    }

    return res.redirect('/events');
});

/* /events/delete/comment/{commentId} */

router.route('/delete/comment/:commentId').get(async (req, res) => {
    let commentId = null,
        accesor = null,
        comment = null;

    try {
        commentId = validateApi.isValidString(xss(req.params.commentId), true);
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    try {
        accesor = validateApi
            .isValidString(usersApi.getLoggedinUser().username, true)
            .toLowerCase();
    } catch (e) {
        return res.status(401).render('other/error', {
            title: 'Unexpected Error: (401)',
            errorMsg: e,
        });
    }

    try {
        const commentExists = await eventsApi.commentExistsById(commentId);
        if (!commentExists)
            return res.status(404).render('other/error', {
                title: 'Unexpected Error: (404)',
                errorMsg: `Error: Could not find a user comment with id '${commentId}'.`,
            });
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    try {
        comment = await eventsApi.getCommentById(commentId, accesor);
    } catch (e) {
        return res.status(403).render('other/error', {
            title: 'Unexpected Error: (403)',
            errorMsg: e,
        });
    }

    if (accesor !== comment.owner.toLowerCase()) {
        return res.status(403).render('other/error', {
            title: 'Unexpected Error: (403)',
            errorMsg: `Error: User '${accesor}' is not authorized to delete the user comment with id '${comment._id.toString()}'.`,
        });
    }

    try {
        comment = convertApi.prettifyComment(comment, false, accesor);
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    return res.render('events/deleteComment', {
        title: 'Delete a Comment',
        params: comment,
    });
});

router.route('/delete/comment/:commentId').delete(async (req, res) => {
    let commentId = null,
        comment = null,
        accesor = null;

    let { isAjaxRequest } = req.body;

    try {
        isAjaxRequest = validateApi.isValidBoolean(
            xss(isAjaxRequest).toLowerCase() === 'true'
        );
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    try {
        commentId = validateApi.isValidString(xss(req.params.commentId), true);
    } catch (e) {
        if (isAjaxRequest) return res.status(400).json({ errorMsg: e });

        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    try {
        accesor = validateApi
            .isValidString(usersApi.getLoggedinUser().username, true)
            .toLowerCase();
    } catch (e) {
        if (isAjaxRequest) return res.status(401).json({ errorMsg: e });

        return res.status(401).render('other/error', {
            title: 'Unexpected Error: (401)',
            errorMsg: e,
        });
    }

    try {
        const commentExists = await eventsApi.commentExistsById(commentId);
        if (!commentExists) {
            if (isAjaxRequest)
                return res.status(404).json({
                    errorMsg: `Error: Could not find a user comment with id '${commentId}'.`,
                });

            return res.status(404).render('other/error', {
                title: 'Unexpected Error: (400)',
                errorMsg: `Error: Could not find a user comment with id '${commentId}'.`,
            });
        }
    } catch (e) {
        if (isAjaxRequest) return res.status(400).json({ errorMsg: e });

        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    try {
        comment = await eventsApi.getCommentById(commentId, accesor);
    } catch (e) {
        if (isAjaxRequest) return res.status(403).json({ errorMsg: e });

        return res.status(403).render('other/error', {
            title: 'Unexpected Error: (403)',
            errorMsg: e,
        });
    }

    if (accesor !== comment.owner.toLowerCase()) {
        if (isAjaxRequest)
            return res.status(403).json({
                errorMsg: `Error: User '${accesor}' is not authorized to delete the user comment with id '${comment._id.toString()}'.`,
            });

        return res.status(403).render('other/error', {
            title: 'Unexpected Error: (403)',
            errorMsg: `Error: User '${accesor}' is not authorized to delete the user comment with id '${comment._id.toString()}'.`,
        });
    }

    try {
        await eventsApi.deleteCommentById(commentId, accesor);
    } catch (e) {
        if (isAjaxRequest) return res.status(500).json({ errorMsg: e });

        return res.status(500).render('other/error', {
            title: 'Unexpected Error: (500)',
            errorMsg: e,
        });
    }

    if (isAjaxRequest) return res.json({ deletedCommentId: commentId });

    return res.redirect('/events');
});

module.exports = router;
