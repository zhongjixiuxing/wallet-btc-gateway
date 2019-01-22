const Mongoose = require('mongoose');
const {isEmpty, last, join} = require('lodash');
const superagent = require('superagent');
const config = require('../config/cfg');
const {Logger} = require('./Logger');
function WalletTool() {}


WalletTool.nextPath = async function (walletCoin) {
    const {WalletCoin} = Mongoose.models;
    const Coins = WalletCoin.schema.Coins;

    switch (walletCoin.coin) {
        case Coins.BTC:
            return await nextPathByBTC(walletCoin);
            break;
        default:
            throw new Error(`un-support coin: ${walletCoin.coin}`);
    }
};

async function nextPathByBTC(walletCoin) {
    let path = walletCoin.path;
    if (isEmpty(path)) {
        path = "m/44'/1'/0'/0/0"; // initial default path
        try {
            await importWallet(walletCoin);
        } catch (e) {
            if (e.hasOwnProperty('status') && e.hasOwnProperty('message')
                && e.status === 500 && e.message === 'Internal Server Error'
                && e.hasOwnProperty('response') && e.response.hasOwnProperty('body')
                && e.response.body.hasOwnProperty('error') && e.response.body.error.code === -4
            ) {
                Logger.warn('[coin/next_path] WalletExists', {id: walletCoin.wallet.id});
                // throw new Error('WalletExists'); //ignore
            } else {
                throw e;
            }
        }

    } else {
        let paths = path.split('/');
        let lastIndex = last(paths);
        lastIndex ++; //next
        paths[paths.length - 1] = lastIndex; // update latest index
        path = join(paths, '/');
    }

    return path;
}



/**
 * 在blockchain节点中创建创建钱包，根据id属性
 *　
 */
async function importWallet(walletCoin) {
    const {WalletCoin} = Mongoose.models;
    const Coins = WalletCoin.schema.Coins;

    switch (walletCoin.coin) {
        case Coins.BTC:
            await importBtcWallet(walletCoin);
            break;
        default:
            throw new Error(`un-support coin: ${walletCoin.coin}`);
    }
}

WalletTool.importWallet = importWallet;

async function importBtcWallet(walletCoin) {
    let walletId = walletCoin.wallet.id;
    let data = {
        jsonrpc: '1.0',
        id: 'curltest',
        method: 'createwallet',
        params: [walletId]
    };

    let res = await superagent
        .post(config.wallet.btc.url)
        .type('json')
        .send(data);

    if (res.status !== 200 || !res.hasOwnProperty('body') || !res.body.hasOwnProperty('error') || res.body.error !== null) {
        console.error('Invalid response : ', res);
        throw res;
    }

    return res;
}

module.exports = {WalletTool};