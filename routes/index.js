const calendarRoute = require('./calendar');
const eventsRoute = require('./events');
const userRoute = require('./user');

const constructorMethod = (app) => {
    app.use('/calendar', calendarRoute);
    app.use('/events', eventsRoute);
    app.use('/user', userRoute);

    app.route('/').get((req, res) => {
        return res.redirect('/calendar');
    });

    app.use('*', (req, res) => {
        return res.status(404).render('other/error', {
            title: 'Unexpected Error: (404)',
            errorMsg: 'Error: The page you are looking for does not exist.',
        });
    });
};

module.exports = constructorMethod;
