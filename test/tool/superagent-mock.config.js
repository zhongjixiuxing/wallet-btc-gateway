/***
 *  superagent-mock config file
 *
 *  @author anxing<anxing131@gmail.com>
 */

const config = require('../../src/config/cfg');

const btcRpcConfig = {
    createwallet: {
        currentRes: 'success', // 当前调用callback, resList 是callback相关callback 列表
        defaultRes: 'success',
        resList: {
            success: function (match, params, headers, context) {
                return {
                    body: {
                        result: {
                            name: `${params.params[0]}`,
                            warning: ""
                        },
                        error: null,
                        id: "curltest"
                    },
                    status: 200
                };
            },
            alreadyExists: function (match, params, headers, context) {
                return {
                    message: 'Internal Server Error',
                    status: 500,
                    response: {
                        body: {
                            id: 'curltest',
                            result: null,
                            error: {
                                code: -4,
                                message: `Wallet ${params.params[0]} already exists.`
                            }
                        }
                    }
                };
            }
        }
    }
};
module.exports.btcRpcConfig = btcRpcConfig;

module.exports.resetResonseConfig = () => {
    btcRpcConfig.createwallet.currentRes = btcRpcConfig.createwallet.defaultRes;
}

module.exports.superagetnMockCfg = [
    {
        /**
         * regular expression of URL
         */
        pattern: `${config.wallet.btc.url}(.*)`,

        /**
         * returns the data
         *
         * @param match array Result of the resolution of the regular expression
         * @param params object sent by 'send' function
         * @param headers object set by 'set' function
         * @param context object the context of running the fixtures function
         */
        fixtures: function (match, params, headers, context) {
            if (process.env.NODE_ENV !== 'test') {
                return context.cancel = true;
            }

            if (match[1] === '' && params.hasOwnProperty('method')) {
                switch (params.method) {
                    case 'createwallet':
                        let callback = btcRpcConfig.createwallet.resList[btcRpcConfig.createwallet.currentRes];
                        if (typeof callback === 'function') {
                            return callback(match, params, headers, context);
                        }

                        break;
                }
            }

            throw new Error(404);
        },

        /**
         * returns the result of the GET request
         *
         * @param match array Result of the resolution of the regular expression
         * @param data  mixed Data returns by `fixtures` attribute
         */
        get: function (match, data) {
            return {
                body: data
            };
        },

        /**
         * returns the result of the POST request
         *
         * @param match array Result of the resolution of the regular expression
         * @param data  mixed Data returns by `fixtures` attribute
         */
        post: function (match, data) {
            return data;
        }
    }
];