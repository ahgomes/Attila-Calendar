const express = require('express');
const router = express.Router();

router.route('/').get((req, res) => {
    return res.render('calendar/calendar', {
        title: 'Calendar Page',
    });
});

module.exports = router;
