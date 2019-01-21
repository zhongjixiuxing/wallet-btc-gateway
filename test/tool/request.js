/**
 * 测试API集合
 *
 * @author anxing<anxing131@gmail.com>
 */

const supertest = require('supertest');
const superagent = require('superagent');
const Rx = require('rxjs/Rx');
const {jsonToQueryString} = require('./tool')

/***
 * 这个是一个特殊的base公用的请求接口函数
 *
 * @param url
 * @param data
 * @param method
 * @returns {Observable<[any , any , any]>}
 */
function request(url, data, method='post') {
    let req = supertest(app)[method](url)
        .send(data)
        .set('Accept', 'application/json');

    return Rx.Observable.bindNodeCallback(req.end.bind(req))();
}

function createWallet(data){
    return request('/v1/wallet', data);
}

function getWallet(data){
    let query = jsonToQueryString(data);
    let url = '/v1/wallet' + query;

    return request(url, null, 'get');
}

function getWalletNextPath(data) {
    return request('/v1/wallet/coin/next_path', data);
}

function updateWalletCoinScanFlag(data) {
    return request('/v1/wallet/coin/update_scan_flag', data);
}

/***
 * request BTC w网络节点
 *
 * @param method
 * @param params
 * @returns {Promise<*>}
 */
async function requestBtcNode(method, params) {
    let res = await superagent
        .post(config.wallet.btc.url)
        .type('content-type', 'text/plain;')
        .send(data);

    return res;
}

module.exports = {
    request,
    createWallet,
    getWallet,
    getWalletNextPath,
    requestBtcNode,
    updateWalletCoinScanFlag,
};