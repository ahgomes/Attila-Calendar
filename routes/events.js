const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    return res.render('calendar/events', {
        title: 'Events Page',
    });
});

module.exports = router;
