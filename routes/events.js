const express = require('express');
const router = express.Router();

const data = require('../data');
const eventsApi = data.eventsApi;
const validateApi = data.validateApi;

router.get('/', (req, res) => {
    return res.render('calendar/events', {
        title: 'Events Page',
    });
});

router.get('/create', (req, res) => {
    return res.render('partials/createEvent', {
        title: 'Create an Event',
        titleValue: '',
        hasNoTitleError: true,
        descValue: '',
        hasNoDescError: true,
        priorityValue: '',
        hasNoPriorityError: true,
        dateValue: '',
        hasNoDateError: true,
        timeValue: '',
        hasNoTimeError: true,
    });
});

router.post('/create', (req, res) => {
    let { input_title, input_desc, input_priority, input_date, input_time } =
        req.body;

    console.log(`title: '${input_title}'`);
    console.log(`desc: '${input_desc}'`);
    console.log(`priority: '${input_priority}'`);
    console.log(`date: '${input_date}'`);
    console.log(`time: '${input_time}'`);

    return res.redirect('/events/create');

    //     return res.render('partials/createEvent', {
    //         title: 'Create an Event',
    //         titleValue: '',
    //         hasNoTitleError: true,
    //         descValue: '',
    //         hasNoDescError: true,
    //         priorityValue: '',
    //         hasNoPriorityError: true,
    //         dateValue: '',
    //         hasNoDateError: true,
    //         timeValue: '',
    //         hasNoTimeError: true,
    //     });
});

module.exports = router;
