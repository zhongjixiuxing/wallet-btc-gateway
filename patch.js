/**
 * 此脚本专门对于一些第三方工具源码进行修改, 已实现己方的需求
 *
 * @author anxing<anxing131@gmail.com>
 */

const fs = require('fs');
const LineReplace = require('line-replace');


/***
 *  修改express-rate-limiter 插件, 增加暴露resetAll feature, 方便在单元测试中重置api的限制
 */
const taskFile = 'node_modules/express-rate-limit/lib/express-rate-limit.js';
LineReplace({
    file: taskFile,
    line: 141,
    addNewLine: true,
    text: '  rateLimit.resetAll = options.store.resetAll.bind(options.store);',
    callback: () => {
        console.log('success patch express-rate-limit plugin');
    }
})


