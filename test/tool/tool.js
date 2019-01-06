/***
 * 单元测试的小工具集合
 *
 * @author anxing<anxing131@gmail.com>
 */


const Mongoose = require("mongoose");

// clear mongodb all collection documents
module.exports.clearDatabase = async () => {
    let keys = Object.keys(Mongoose.models);
    for (let i = 0; i < keys.length; i++) {
        await Mongoose.models[keys[i]].remove(); // remove all documents
    }
};

/***
 * transfer json object to http query string
 *
 * @param json
 * @returns {string}
 */
module.exports.jsonToQueryString = (json = {}) => {
    let attrs = Object.keys(json);
    let query = '';
    for(let i=0; i<attrs.length; i++) {
        let key = attrs[i];
        let attrVal = json[key];
        let head = '&';
        if(i === 0){
            head = '?';
        }

        if(Array.isArray(attrVal)){
            let arrValue = '';
            for(let k=0; k < attrVal.length; k++) {
                if(k === 0){
                    arrValue = attrVal[k];
                    continue;
                }

                arrValue = `${arrValue},${attrVal[k]}`;
            }

            attrVal = arrValue;
        }

        query = `${query}${head}${key}=${attrVal}`;
    }

    return query;
};