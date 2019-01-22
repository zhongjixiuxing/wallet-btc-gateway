const {Subject} = require('rxjs');

function Logger() {}

Logger.event$ = new Subject();
Logger.logs = [];
Logger.displayTtyCfg = 'error.debug.info.warn'; //tty display控制, 目前只支持这四种级别

/**
 * 保存数据到内存
 *
 * @param level
 * @param msg
 * @param optionalParams
 */
function add(level, msg, ...optionalParams) {
    let newLog = {
        ts: new Date().toISOString(),
        level,
        msg,

    };

    Logger.logs.push(newLog);
}

/**
 * 输出到终端控制台
 *
 * @param level
 * @param msg
 * @param optionalParams
 *
 * @return boolean
 */
function displayToTTY(level, msg, ...optionalParams){
    if (Logger.displayTtyCfg.indexOf(level) === -1) {
        return false; //不需要输出到tty
    }

    console.error(msg, optionalParams)
    return true;
}

Logger.displayToTTY = displayToTTY;

/**
 * 格式化参数
 *
 * @param argsValues
 * @returns {string}
 */
function processingArgs(argsValues) {
    let args = Array.prototype.slice.call(argsValues); //将argsValues 对象类型转为数组类型

    args = args.map(arg => {
        try {
            if (typeof arg === 'undefined') {
                arg = 'undefined';
            }

            if (!arg) {
                arg = 'null';
            }

            if (typeof arg === 'object') {
                arg = arg.message ? arg.message : JSON.stringify(arg);
            }
        } catch (e) {
            console.error('Error at logger decorator: ', e);
            arg = 'undefined';
        }

        return arg;
    });

    return args.join(' ');
}

function handler(level, message, optionalParams, args){
    Logger.displayToTTY(level, message, optionalParams);
    add(level, processingArgs(args));

    Logger.event$.next({
        level,
        args
    });
}

Logger.error = async (message, ...optionalParams) => {
    handler('error', message, optionalParams, [message, optionalParams]);
};

Logger.debug =async (message, ...optionalParams) => {
    handler('debug', message, optionalParams, [message, optionalParams]);
};

Logger.warn = async (message, ...optionalParams) => {
    handler('warn', message, optionalParams, [message, optionalParams]);
};

Logger.info = async (message, ...optionalParams) => {
    handler('info', message, optionalParams, [message, optionalParams]);
};


module.exports = {Logger};