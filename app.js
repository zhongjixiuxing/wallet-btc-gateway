const express = require('express');
const cors = require('cors');
const validator = require('express-validator');
const isUuid = require('is-uuid');
// const ApiRateLimiter = require('express-rate-limit');
const {RateLimiter} = require('./src/services/rateLimiter');

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(validator({customValidators: {}}));

app.enable('trust proxy');
const apiRateLimiter = RateLimiter({
    windowMs: 60000, // 1 min
    max: 500
});
app.use(apiRateLimiter); // global api rate limiter
app.set('RateLimiter', RateLimiter);

// initial router
require('./src/router/index')(app);

// error handler
app.use(function(err, req, res, next) {
    console.error('application intenel error : ', err);
    // set locals, only providing error in development
    res.locals.message = err.message;

    // render the error page/,
    res.status(err.status || 500);
    res.json({err: 'ServerError'});
});

module.exports = app;