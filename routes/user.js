const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    return res.render('calendar/user', {
        title: 'User Page',
    });
});

module.exports = router;
