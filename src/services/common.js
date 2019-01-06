const {isEmpty} = require('lodash');
const errorCodes = require('./errorCodes');

/**
 * response json format data
 *
 * @param res
 * @param data
 * @param code
 */
const resJson = (res, data, code) => {
    res.json({
        err: code || errorCodes.OK,
        data: data
    });
};
module.exports.resJson = resJson;

module.exports.resTooManyRequest = (res, status=429, text='Too many requests, please try again later.') => {
    return res.status(status).send(text);
};

/**
 * catch controller action async/await exception
 *
 * @param fn
 * @returns {Function}
 */
module.exports.catchAsyncErrors =  (fn) => {
    return (req, res, next) => {
        const routePromise = fn(req, res,next);
        if (routePromise.catch) {
            routePromise.catch(err => next(err));
        }
    }
};

/***
 * check request params
 *
 * @param req
 * @param res
 * @param validation
 * @param async
 * @returns {Promise<boolean>}
 */
module.exports.checkParams = async (req, res, validation, async = false) => {
    try {
        req.check(validation);
        let errors = null;

        if (async) {
            errors = await req.asyncValidationErrors();
        } else {
            errors = req.validationErrors();
        }

        if (!isEmpty(errors)) {
            resJson(res, erros, errorCodes.ParamsError);

            return false;
        }

        return true;
    } catch (e) {
        if (Array.isArray(e)) {
            resJson(res, e, errorCodes.ParamsError);
            return false;
        }

        throw e;
    }
};

module.exports.errorCodes = errorCodes;