const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    return res.render('other/user', {
        title: 'User Page',
    });
});

module.exports = router;
