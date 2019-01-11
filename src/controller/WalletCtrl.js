const express = require('express');
const router = express.Router();
const Mongoose = require('mongoose');
const {catchAsyncErrors, resJson, checkParams, errorCodes, resTooManyRequest} = require('../services/common');
const {map, isEmpty}  = require('lodash');
const {RateLimiter} = require('../services/rateLimiter');
const {WalletTool} = require('../services/WalletTool');


/**
 * @api {post} /wallet 创建Wallet
 * @apiGroup Wallet
 *
 * @apiParam {String} id 钱包id, UUID v4 格式
 * @apiParam {String} name 钱包名称
 * @apiParam {Enum} [type="mnemonic"] 钱包类型
 *      mnemonic  <==>  助记词
 * @apiParam {String} hash 钱包的特殊hash值, 这个也是能确定一个钱包的唯一性. 如果当前系统存在hash, 则返回存在wallet 数据
 *
 * @apiSuccess {String} id 请求创建成功的id, 与请求的id一致.
 *
 * @apiError DuplicateRequest 重复创建, 依据id唯一性
 *
 * @apiVersion v1.0.0
 */
router.post('', RateLimiter({windowMs: 60000, max: 5}), catchAsyncErrors(async (req, res) => {
    const {Wallet} = Mongoose.models;

    const validation = {
        id: {
            trim: true,
            notEmpty: true,
            isUUID: {
                options: 4,
            }
        },
        name: {
            trim: true,
            notEmpty: true,
            isLength: {
                options: {
                    max: 64
                }
            }
        },
        type: {
            optional: true,
            notEmpty: false,
            trim: true,
            isIn: {
                options: map(Wallet.schema.types)
            }
        },
        hash: {
            trim: true,
            notEmpty: true,
        }
    };

    if (!await checkParams(req, res, validation, true)) {
        return;
    }


    let wallet = await Wallet.findOne({
        hash: req.body.hash
    });
    if (!wallet) {
        wallet = new Wallet();
        wallet.id = req.body.id;
        wallet.name = req.body.name;
        wallet.hash = req.body.hash;

        if (!isEmpty(req.body.type)) {
            wallet.type = req.body.type;
        }
    }

    try {
        await wallet.save();
    } catch (e) {
        if (e.hasOwnProperty('code') && e.hasOwnProperty('name') && e.code === 11000 && e.name === 'MongoError') {
            return resJson(res, null, errorCodes.DuplicateRequest);
        }

        throw e;
    }

    resJson(res, {id: wallet.id, name: wallet.name});
}));

/**
 *
 * @api {get} /wallet 获取Wallet
 * @apiGroup Wallet
 *
 * @apiSuccess {String} id 钱包id, UUID v4 格式
 * @apiSuccess {String} name 钱包名称
 * @apiSuccess {Enum} type 钱包类型
 *      mnemonic  <==>  助记词
 * @apiSuccess {String} createdAt 创建时间
 * @apiSuccess {Array[WalletCoin]} coins 钱包coin列表
 *
 * @apiError NotFound id 获取不到
 *
 * @apiVersion v1.0.0
 */
router.get('', RateLimiter({windowMs: 60000, max: 30}), catchAsyncErrors(async (req, res) => {
    const validation = {
        id: {
            trim: true,
            notEmpty: true,
            isUUID: {
                options: 4,
            }
        }
    };

    if (!await checkParams(req, res, validation, true)) {
        return;
    }

    const {Wallet, WalletCoin} = Mongoose.models;
    let wallet = await Wallet.findOne({id: req.query.id});
    if (!wallet) {
        return resJson(res, null, errorCodes.NotFound);
    }

    let result = {
        id: wallet.id,
        name: wallet.name,
        createdAt: wallet.createdAt.getTime(),
    };

    let coins = [];
    let walletCoins = await WalletCoin.find({wallet: wallet});
    walletCoins.forEach((coin) => {
        coins.push({
            id: coin._id,
            coin: coin.coin,
            path: coin.path,
            createdAt: coin.createdAt.getTime()
        });
    });
    result.coins = coins;

    resJson(res, result);
}));

/**
 *
 * @api {post} /wallet/coin/next_path 获取并更新下个路径
 * @apiGroup Wallet
 *
 * @apiSuccess {String} path string bip44 格式
 *
 * @apiVersion v1.0.0
 */
router.post('/coin/next_path', RateLimiter({windowMs: 60000, max: 30}), catchAsyncErrors(async (req, res) => {
    const {Wallet, WalletCoin} = Mongoose.models;
    const validation = {
        walletId: {
            trim: true,
            notEmpty: true,
            isUUID: {
                options: 4,
            }
        },
        coin:{
            isIn: {
                options: map(WalletCoin.schema.Coins)
            }
        }
    };

    if (!await checkParams(req, res, validation, true)) {
        return;
    }

    let wallet = await Wallet.findOne({id: req.body.walletId});
    if (!wallet) {
        return resJson(res, [{
            "location": "body",
            "param": "walletId",
            "msg": "Invalid value",
            "value": req.body.walletId
        }], errorCodes.ParamsError);
    }

    let coin = await WalletCoin.findOne({wallet: wallet, coin: req.body.coin}).populate('wallet');
    if (!coin) {
        coin = new WalletCoin();
        coin.coin = req.body.coin;
        coin.wallet = wallet;

        try {
            await coin.save();
        } catch (e) {
            if (e.hasOwnProperty('code') && e.hasOwnProperty('name') && e.code === 11000 && e.name === 'MongoError') {
                return resTooManyRequest(res);
            }
        }
    }

    let path;
    try {
        path = await WalletTool.nextPath(coin);
    } catch (e) {
        if (e.hasOwnProperty('message') && e.message === 'WalletExists') {
            return resJson(res, {message: 'create wallet to node error'}, errorCodes.ServerError);
        }

        throw e;
    }
    coin.path = path; // update path

    await coin.save();
    resJson(res, {path});
}));


module.exports = router;