const express = require('express');
const router = express.Router();
const data = require('../data');
const eventQuerying = data.eventQuerying;

async function get_events(req) {
    let user = req.session.user;
    let list = await eventQuerying.listUserEvents(user);
    if (Array.isArray(list))
        return list;
}

router.route('/').get(async (req, res) => {
    return res.render('calendar/calendar', {
        title: 'Calendar Page',
        event_list: await get_events(req),
    });
});

module.exports = router;
