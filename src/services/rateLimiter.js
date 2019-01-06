const ExpressRateLimiter = require('express-rate-limit');

let rateLimiterList = [];

function RateLimiter(options) {
    let limiter = ExpressRateLimiter(options);

    rateLimiterList.push(limiter);

    return limiter;
}

RateLimiter.resetAll = function() {
    for(let i=0; i<rateLimiterList.length; i++) {
        let limiter = rateLimiterList[i];
        limiter.resetAll();
    }
}


module.exports.rateLimiterList = rateLimiterList;
module.exports.RateLimiter = RateLimiter;