const express = require('express');
const router = express.Router();
const xss = require('xss');

const data = require('../data');
const usersApi = data.usersApi;
const calendarsApi = data.calendarsApi;
const eventsApi = data.eventsApi;
const convertApi = data.convertApi;
const validateApi = data.validateApi;
const eventQuerying = data.eventQuerying;

/* /events */

router.route('/').get(async (req, res) => {
    let owner = null,
        events = null;

    try {
        owner = validateApi
            .isValidString((await usersApi.getLoggedinUser(req)).username, true)
            .toLowerCase();
    } catch (e) {
        return res.status(401).render('other/error', {
            title: 'Unexpected Error: (401)',
            errorMsg: e,
        });
    }

    try {
        events = await eventQuerying.listUserEvents(owner);
        if (Array.isArray(events)) {
            events = events.map((elem) =>
                convertApi.eventToEventView(
                    convertApi.prettifyEvent(elem, false, owner),
                    true,
                    false,
                    false
                )
            );
        }
    } catch (e) {
        return res.status(500).render('other/error', {
            title: 'Unexpected Error: (500)',
            errorMsg: e,
        });
    }

    return res.render('events/main', {
        title: 'Events Page',
        events,
    });
});

/* /events/searchPage */
// Need to ensure the user can only view/search their own events
router.route('/searchPage').post(async (req, res) => {
    let owner = null, eventQuery = null;
    eventSearch = req.body;
    eventSearch.searchOption = xss(eventSearch.searchOption);
    eventSearch.searchTerm = xss(eventSearch.searchTerm);
    
    try {
        owner = validateApi
        .isValidString((await usersApi.getLoggedinUser(req)).username, true)
        .toLowerCase();
    } catch (e) {
        return res.status(401).render('other/error', {
            title: 'Unexpected Error: (401)',
            errorMsg: e,
        });
    }

    try {
        eventSearch.searchOption = validateApi.isValidString(eventSearch.searchOption, true);
        if (eventSearch.searchOption !== "User" && eventSearch.searchOption !== "Title/Description" && eventSearch.searchOption !== "Priority" && eventSearch.searchOption !== "Date") {
            throw `Error: '${eventSearch.searchOption}' is not a valid search type.`
        }

        if (eventSearch.searchOption == "User" || eventSearch.searchOption == "Title/Description" || eventSearch.searchOption == "Date") {
            eventSearch.searchTerm = validateApi.isValidString(eventSearch.searchTerm, true);
        }
        else {
            eventSearch.searchTerm = Number(eventSearch.searchTerm);
            eventSearch.searchTerm = validateApi.isValidNumber(eventSearch.searchTerm, true);
            if (eventSearch.searchTerm < 1 || eventSearch.searchTerm > 5) {
                throw `Error: '${eventSearch.searchTerm}' is not a valid priority.`
            }
        }
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }
    
    try {
        // console.log(eventSearch)
        if (eventSearch.searchOption == "User") {
            eventQuery = await eventQuerying.listUserEvents(eventSearch.searchTerm, owner)
        }
        else if (eventSearch.searchOption == "Title/Description") {
            eventQuery = await eventQuerying.searchEvents(eventSearch.searchTerm, owner)
        }
        else if (eventSearch.searchOption == "Date") {
            // TODO: Might have to account for lowercase input or validate for it
            month = eventSearch.searchTerm.substring(0,2)
            day = eventSearch.searchTerm.substring(3,5)
            year = eventSearch.searchTerm.substring(6,12)

            day == "XX" ? dayValue = false : dayValue = Number(day)
            month == "XX" ? monthValue = false : monthValue = Number(month)
            year == "XXXX" ? yearValue = false : yearValue = Number(year)

            if (dayValue != false) {
                if (isNaN(dayValue)) {
                    throw `Error: '${eventSearch.searchTerm}' is not a valid formatted date.`
                }
            }

            if (monthValue != false) {
                if (isNaN(monthValue)) {
                    throw `Error: '${eventSearch.searchTerm}' is not a valid formatted date.`
                }
            }

            if (yearValue != false) {
                if (isNaN(yearValue)) {
                    throw `Error: '${eventSearch.searchTerm}' is not a valid formatted date.`
                }
            }

            eventQuery = await eventQuerying.filterEventDate(monthValue, dayValue, yearValue, owner)
        }
        else if (eventSearch.searchOption == "Priority") {
            // console.log(owner)
            eventQuery = await eventQuerying.searchEventPriority(eventSearch.searchTerm, owner)
        }
    } catch (e) {
        return res.status(500).render('other/error', {
            title: 'Unexpected Error: (500)',
            errorMsg: e,
        });
    }

    return res.status(200).render('events/searchEvents', {
        title: 'Events Found',
        eventSearchTerm: eventSearch.searchTerm,
        eventSearchOption: eventSearch.searchOption,
        events: eventQuery,
    });
});

router.route('/searchpage/filterPriority').post(async (req, res) => {
    let owner = null, filterEvents = null;
    req.body.eventSearchOption = xss(req.body.eventSearchOption);
    req.body.eventSearchTerm = xss(req.body.eventSearchTerm);
    req.body.priorityOrder = xss(req.body.priorityOrder);

    try {
        owner = validateApi
        .isValidString((await usersApi.getLoggedinUser(req)).username, true)
        .toLowerCase();
    } catch (e) {
        return res.status(401).render('other/error', {
            title: 'Unexpected Error: (401)',
            errorMsg: e,
        });
    }

    try {
        req.body.eventSearchOption = validateApi.isValidString(req.body.eventSearchOption, true);
        if (req.body.eventSearchOption !== "User" && req.body.eventSearchOption !== "Title/Description" && req.body.eventSearchOption !== "Date" && req.body.eventSearchOption !== "Priority") {
            throw `Error: '${req.body.eventSearchOption}' is not a valid search type.`
        }

        if (req.body.eventSearchOption == "User" || req.body.eventSearchOption == "Title/Description" || req.body.eventSearchOption == "Date") {
            req.body.eventSearchTerm = validateApi.isValidString(req.body.eventSearchTerm, true);
        }
        else {
            req.body.eventSearchTerm = Number(req.body.eventSearchTerm);
            req.body.eventSearchTerm = validateApi.isValidNumber(req.body.eventSearchTerm, true);
            if (req.body.eventSearchTerm < 1 || req.body.eventSearchTerm > 5) {
                throw `Error: '${req.body.eventSearchTerm}' is not a valid priority.`
            }
        }
        
        req.body.priorityOrder = validateApi.isValidString(req.body.priorityOrder, true)
        if (req.body.priorityOrder != "asc" &&  req.body.priorityOrder != "desc") {
            throw "Error: sort/filter order should be 'asc' or 'desc'"
        }
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    try {
        // console.log("Route:", req.body)
        filterEvents = await eventQuerying.filterEventPriority(req.body.eventSearchOption, req.body.eventSearchTerm, req.body.priorityOrder, owner)
    } catch (e) {
        return res.status(500).render('other/error', {
            title: 'Unexpected Error: (500)',
            errorMsg: e,
        });
    }

    return res.status(200).render('events/searchEvents', {
        title: 'Events Found',
        eventSearchTerm: req.body.eventSearchTerm,
        eventSearchOption: req.body.eventSearchOption,
        events: filterEvents,
    })
})

/* /events/create */

router.route('/create').get(async (req, res) => {
    let { has_calendar, has_date, date } = req.body;

    let calendars = null,
        deadline = null;

    try {
        calendars = (await usersApi.getLoggedinUser(req)).calendars;
    } catch (e) {
        return res.status(401).render('other/error', {
            title: 'Unexpected Error: (401)',
            errorMsg: e,
        });
    }

    try {
        has_calendar = xss(has_calendar);
        if (xss(has_date).toLowerCase() === 'true')
            deadline = xss(date)
                    ? convertApi.dateToDateString(new Date(date))
                    : convertApi.dateToDateString(new Date());
        else deadline = ''
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    const calendarView = {
        value: has_calendar,
        values: calendars,
        noError: true,
    };
    const titleView = { value: '', noError: true };
    const descView = { value: '', noError: true };
    const priorityView = { value: '', noError: true };
    const dateView = { value: deadline, noError: true };
    const timeView = { value: '', noError: true };

    return res.render('events/create', {
        title: 'Create an Event',
        scriptSource: '/public/js/events/createEvent.js',
        calendarView,
        titleView,
        descView,
        priorityView,
        dateView,
        timeView,
    });
});

router.route('/create').post(async (req, res) => {
    let {
        input_calendar,
        input_title,
        input_desc,
        input_priority,
        input_date,
        input_time,
    } = req.body;

    const calendarView = {
        value: xss(input_calendar),
        values: [],
        noError: true,
        errorMsg: null,
    };
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
        const loggedInUser = await usersApi.getLoggedinUser(req);
        owner = validateApi
            .isValidString(loggedInUser.username, true)
            .toLowerCase();
        calendarView.values = loggedInUser.calendars;
    } catch (e) {
        return res.status(401).render('other/error', {
            title: 'Unexpected Error: (401)',
            errorMsg: e,
        });
    }

    try {
        input_calendar = validateApi.isValidString(calendarView.value, true);
        await calendarsApi.getCalendarById(input_calendar, owner);
    } catch (e) {
        calendarView.noError = false;
        calendarView.errorMsg = e;
    }

    try {
        input_title = validateApi.isValidString(titleView.value, true);
        if (input_title.length > 300)
            throw `Error: Title cannot exceed 300 characters. (${input_title.length} characters detected)`;
    } catch (e) {
        titleView.noError = false;
        titleView.errorMsg = e;
    }

    try {
        input_desc = validateApi.isValidString(descView.value, false);
        if (input_desc.length > 2000)
            throw `Error: Description cannot exceed 2000 characters. (${input_desc.length} characters detected)`;
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
        !calendarView.noError ||
        !titleView.noError ||
        !descView.noError ||
        !priorityView.noError ||
        !dateView.noError ||
        !timeView.noError
    )
        return res.status(400).render('events/create', {
            title: 'Create an Event',
            scriptSource: '/public/js/events/createEvent.js',
            calendarView,
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
            input_calendar,
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
            .isValidString((await usersApi.getLoggedinUser(req)).username, true)
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
            .isValidString((await usersApi.getLoggedinUser(req)).username, true)
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
        if (input_title.length > 300)
            throw `Error: Title cannot exceed 300 characters. (${input_title.length} characters detected)`;
    } catch (e) {
        titleView.noError = false;
        titleView.errorMsg = e;
    }

    try {
        input_desc = validateApi.isValidString(descView.value, false);
        if (input_desc.length > 2000)
            throw `Error: Description cannot exceed 2000 characters. (${input_desc.length} characters detected)`;
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
        event = null,
        eventView = null;

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
            .isValidString((await usersApi.getLoggedinUser(req)).username, true)
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
        eventView = convertApi.eventToEventView(event, false, true, true);
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    return res.render('events/view', {
        title: 'View an Event',
        eventView,
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
            .isValidString((await usersApi.getLoggedinUser(req)).username, true)
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
            .isValidString((await usersApi.getLoggedinUser(req)).username, true)
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
        if (input_comment.length > 1000)
            throw `Error: Comment cannot exceed 1000 characters. (${input_comment.length} characters detected)`;
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
        event = null,
        eventView = null;

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
            .isValidString((await usersApi.getLoggedinUser(req)).username, true)
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
        eventView = convertApi.eventToEventView(event, false, false, false);
    } catch (e) {
        return res.status(400).render('other/error', {
            title: 'Unexpected Error: (400)',
            errorMsg: e,
        });
    }

    return res.render('events/deleteEvent', {
        title: 'Delete an Event',
        eventView,
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
            .isValidString((await usersApi.getLoggedinUser(req)).username, true)
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
        await calendarsApi.getUserFromEventById(eventId, accesor);
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
            .isValidString((await usersApi.getLoggedinUser(req)).username, true)
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

    let isAjaxRequest = xss(req.body.isAjaxRequest);

    try {
        isAjaxRequest = validateApi.isValidBoolean(
            isAjaxRequest.toLowerCase() === 'true'
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
            .isValidString((await usersApi.getLoggedinUser(req)).username, true)
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
