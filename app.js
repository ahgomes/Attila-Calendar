const express = require('express');
const app = express();
const session = require('express-session');
const static = express.static(__dirname + '/public');

const configRoutes = require('./routes');
const express_handlebars = require('express-handlebars');

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', (req, res, next) => {
    if (req.body?._method) {
        req.method = req.body._method;
        delete req.body._method;
    }

    next();
});

app.use(
    session({
        name: 'AuthCookie',
        secret: 'some secret string!',
        resave: false,
        saveUninitialized: true,
    })
);

app.use('/events', (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/user');
    } else {
      next();
    }
  });

  app.use('/calendar', (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/user');
    } else {
      next();
    }
  });

app.engine(
    'handlebars',
    express_handlebars.engine({
        defaultLayout: 'main',
        partialsDir: ['views/partials/'],
        helpers: {
            // what a savior https://stackoverflow.com/questions/34252817/handlebarsjs-check-if-a-string-is-equal-to-a-value
            ifEqual: (arg1, arg2, options) =>
                arg1.toString() === arg2.toString()
                    ? options.fn(this)
                    : options.inverse(this),
        },
    })
);
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
    console.log('Started server on http://localhost:3000');
});
