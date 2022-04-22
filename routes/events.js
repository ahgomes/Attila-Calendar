const express = require('express');
const router = express.Router();
const xss = require('xss');
const { events } = require('../config/mongoCollections');

const data = require('../data');
const usersApi = data.usersApi;
const eventsApi = data.eventsApi;
const convertApi = data.convertApi;
const validateApi = data.validateApi;

/* /events */

router.route('/').get((req, res) => {
    return res.render('events/main', {
        title: 'Events Page',
    });
});

/* /events/create */

router.route('/create').get((req, res) => {
    return res.render('events/create', {
        title: 'Create an Event',
        scriptSource: '/public/js/events/createEvent.js',
        titleView: { value: '', noError: true },
        descView: { value: '', noError: true },
        priorityView: { value: '', noError: true },
        dateView: { value: '', noError: true },
        timeView: { value: '', noError: true },
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

    const deadline = new Date(event.deadline);

    return res.render('events/edit', {
        title: 'Edit an Event',
        scriptSource: '/public/js/events/editEvent.js',
        eventId,
        titleView: { value: event.title, noError: true },
        descView: { value: event.description, noError: true },
        priorityView: { value: event.priority, noError: true },
        dateView: {
            value: convertApi.dateToDateString(deadline),
            noError: true,
        },
        timeView: {
            value: convertApi.dateToTimeString(deadline),
            noError: true,
        },
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
        return res.status(400).render('events/edit', {
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

    event.deadline = convertApi.dateToReadableString(new Date(event.deadline));

    return res.render('events/view', {
        title: 'View an Event',
        titleExists: event.title.trim().length > 0,
        descExists: event.description.trim().length > 0,
        event,
    });
});

module.exports = router;
