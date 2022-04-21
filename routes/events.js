const express = require('express');
const router = express.Router();
const xss = require('xss');

const data = require('../data');
const usersApi = data.usersApi;
const eventsApi = data.eventsApi;
const convertApi = data.convertApi;
const validateApi = data.validateApi;

router.get('/', (req, res) => {
    return res.render('events/main', {
        title: 'Events Page',
    });
});

router.get('/create', (req, res) => {
    return res.render('events/create', {
        title: 'Create an Event',
        scriptSource: '/public/js/events/createEvent.js',
        titleView: { noError: true },
        descView: { noError: true },
        priorityView: { noError: true },
        dateView: { noError: true },
        inputView: { noError: true },
    });
});

router.post('/create', (req, res) => {
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
        deadline = null;

    try {
        owner = validateApi
            .isValidString(usersApi.getLoggedinUser().username, true)
            .toLowerCase();
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: 'Error: Could not locate logged-in user.',
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
        eventsApi.createNewEvent(
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

    return res.redirect('/events');
});

module.exports = router;
