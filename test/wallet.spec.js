const {assert} = require('chai');
const Mongoose = require('mongoose');
const Rx = require('rxjs/Rx');
const {errorCodes} = require('../src/services/common');
const {map, last} = require('lodash');
const sinon = require('sinon');
const {clearDatabase, jsonToQueryString} = require('./tool/tool');
const {getWallet, createWallet, getWalletNextPath} = require('./tool/request');
const {baseData} = require('./tool/data');
const superagent = require('superagent');
const superagentMock = require('superagent-mock');
const {superagetnMockCfg, btcRpcConfig, resetResonseConfig} = require('./tool/superagent-mock.config');

/**
 *
 * ServiceUnitTest: 工具class 的单元测试
 * IntegrationTest: 应用层/controller 层的集成测试
 */

let app;

/**
 *  关于钱包resource的测试
 */
describe('Wallet', () => {
    let Wallet, WalletCoin, sandbox, RateLimiter, superagentMockInstance;
    before(() => {
        return new Promise((resolve, reject) => {
            require('../bin/www')
                .then(res => {
                    app = res;
                    global.app = app; // pass to request.js file by global
                    RateLimiter = app.get('RateLimiter');
                    Wallet = Mongoose.model('Wallet');
                    WalletCoin = Mongoose.model('WalletCoin');

                    resolve();
                })
                .catch(err => reject(err))
        })
    });

    beforeEach(() => {
        superagentMockInstance = superagentMock(superagent, superagetnMockCfg);
        sandbox = sinon.createSandbox();
        RateLimiter.resetAll();
    });

    afterEach(async () => {
        // refresh mock instance
        superagentMockInstance.unset();
        resetResonseConfig();
        superagentMockInstance = superagentMock(superagent, superagetnMockCfg);

        sandbox.restore();
        await clearDatabase();
    });

    describe('ServiceUnitTest', () => {

        // post v1/wallet
        describe('create', () => {
            it('work', (done) => {
                let data = baseData.wallets[0];

                createWallet(data)
                    .flatMap(
                        res => {
                            assert.deepEqual(res.body.err, errorCodes.OK);

                            assert.ownProperty(res.body.data, 'id');
                            assert.equal(data.id, res.body.data.id);

                            return Wallet.findOne({id: data.id});
                        }
                    )
                    .subscribe(
                        wallet => {
                            assert.isTrue(!!wallet);
                            assert.equal(wallet.id, data.id);
                            assert.equal(wallet.name, data.name);
                            assert.equal(wallet.type, Wallet.schema.types.mnemonic); // default type
                            done();
                        },
                        err => done(err)
                    );
            });

            it('fail create with invalid type[123]', done => {
                let data = {
                    id: 'c51c80c2-66a1-442a-91e2-4f55b4256a72',
                    name: 'wallet-name',
                    type: 123
                };

                createWallet(data)
                    .subscribe(
                        res => {
                            assert.equal(res.body.err, errorCodes.ParamsError);
                            assert.include(map(res.body.data, 'param'), 'type');
                            done();
                        },
                        err => done(err)
                    )
            });

            it('success create with special type[mnemonic]', done => {
                let data = {
                    id: 'c51c80c2-66a1-442a-91e2-4f55b4256a72',
                    name: 'wallet-name',
                    type: 'mnemonic'
                };

                createWallet(data)
                    .subscribe(
                        res => {
                            assert.equal(res.body.err, errorCodes.OK);
                            done();
                        },
                        err => done(err)
                    )
            });

            it('duplicate create', done => {
                let data = {
                    id: 'c51c80c2-66a1-442a-91e2-4f55b4256a72',
                    name: 'wallet-name'
                };

                return createWallet(data)
                    .flatMap(res => {
                        return createWallet(data)
                    })
                    .subscribe(
                        res => {
                            assert.equal(res.body.err, errorCodes.DuplicateRequest);
                            done();
                        },
                        err => done(err)
                    )
            });

            it('DDOS request', done => {
                let data = {
                    id: 'c51c80c2-66a1-442a-91e2-4f55b4256a72',
                    name: 'wallet-name',
                };

                createWallet(data)
                    .flatMap( res => createWallet(data))
                    .flatMap( res => createWallet(data))
                    .flatMap( res => createWallet(data))
                    .flatMap( res => createWallet(data))
                    .flatMap( res => createWallet(data))
                    .subscribe(
                        res => {
                            assert.deepStrictEqual(res.status, 429);
                            assert.equal(res.text, 'Too many requests, please try again later.');
                            done();
                        },
                        err => done(err)
                    )
            });
        });

        // get v1/wallet
        describe('get', () => {
            it('work', done => {
                let data = baseData.wallets[0];

                createWallet(data)
                    .flatMap(res => createWallet(baseData.wallets[1]))
                    .flatMap(res => getWallet({id: data.id}))
                    .subscribe(
                        res => {
                            assert.deepStrictEqual(res.body.err, errorCodes.OK);
                            assert.ownProperty(res.body.data, 'id');
                            assert.ownProperty(res.body.data, 'name');
                            assert.ownProperty(res.body.data, 'createdAt');
                            assert.ownProperty(res.body.data, 'coins');

                            assert.deepStrictEqual(res.body.data.id, data.id);
                            assert.deepStrictEqual(res.body.data.name, data.name);
                            assert.typeOf(res.body.data.createdAt, 'number');
                            assert.deepStrictEqual(res.body.data.coins.length, 0);
                            done();
                        },
                        err => done(err)
                    );
            });

            it('get with invalid id', done => {
                let data = baseData.wallets[0];

                createWallet(data)
                    .flatMap(
                        res => {
                            return getWallet({id: baseData.wallets[1].id});
                        }
                    )
                    .subscribe(
                        res => {
                            assert.deepStrictEqual(res.body.err, errorCodes.NotFound);
                            done();
                        },
                        err => done(err)
                    );
            });

            it('DDOS request', done => {
                let data = baseData.wallets[0];

                createWallet(data)
                    .flatMap(res => {
                        let promises = [];
                        for(let i=0; i<50; i++) {
                            promises.push(getWallet({id: data.id}));
                        }

                        return Rx.Observable.zip(...promises);
                    })
                    .subscribe(
                        promises => {
                            assert.isNotEmpty(promises);
                            let lastRequest = last(promises);
                            assert.isTrue(!!lastRequest);
                            assert.deepStrictEqual(lastRequest.status, 429);
                            assert.deepStrictEqual(lastRequest.text, 'Too many requests, please try again later.');

                            done();
                        },
                        err => done(err)
                    );
            });
        });

        // v1/wallet/coin/next_path
        describe('v1/wallet/coin/next_path', () => {
            it('work', done => {
                let walletData = baseData.wallets[0];

                createWallet(walletData)
                    .flatMap(
                        res => {
                            return getWalletNextPath({
                                walletId: walletData.id,
                                coin: 'BTC'
                            });
                        }
                    )
                    .flatMap(
                        res => {
                            assert.deepStrictEqual(res.body.err, errorCodes.OK);
                            assert.ownProperty(res.body.data, 'path');

                            assert.deepStrictEqual(res.body.data.path, "m/44'/1'/0'/0/0");

                            return getWallet({id: walletData.id});
                        }
                    )
                    .subscribe(
                        res => {
                            assert.deepStrictEqual(res.body.err, errorCodes.OK);
                            assert.ownProperty(res.body.data, 'coins');

                            assert.deepStrictEqual(res.body.data.coins.length, 1);

                            let btcCoinData = res.body.data.coins[0];
                            assert.ownProperty(btcCoinData, 'id');
                            assert.ownProperty(btcCoinData, 'coin');
                            assert.ownProperty(btcCoinData, 'path');
                            assert.ownProperty(btcCoinData, 'createdAt');
                            assert.deepStrictEqual(btcCoinData.coin, 'BTC');
                            assert.deepStrictEqual(btcCoinData.path, "m/44'/1'/0'/0/0");
                            assert.typeOf(btcCoinData.createdAt, 'number');

                            done();
                        },
                        err => done(err)
                    )

            });

            it('duplication request', done => {
                let walletData = baseData.wallets[0];

                createWallet(walletData)
                    .flatMap(
                        res => {
                            return getWalletNextPath({
                                walletId: walletData.id,
                                coin: 'BTC'
                            });
                        }
                    )
                    .flatMap(
                        res => {
                            return getWalletNextPath({
                                walletId: walletData.id,
                                coin: 'BTC'
                            });
                        }
                    )
                    .flatMap(
                        res => {
                            assert.deepStrictEqual(res.body.err, errorCodes.OK);
                            assert.ownProperty(res.body.data, 'path');

                            assert.deepStrictEqual(res.body.data.path, "m/44'/1'/0'/0/1");

                            return getWallet({id: walletData.id});
                        }
                    )
                    .subscribe(
                        res => {
                            assert.deepStrictEqual(res.body.err, errorCodes.OK);
                            assert.deepStrictEqual(res.body.data.coins[0].path, "m/44'/1'/0'/0/1");
                            done();
                        },
                        err => done(err)
                    )
            });

            it('request with invalid coin[123]', done => {
                let walletData = baseData.wallets[0];

                createWallet(walletData)
                    .flatMap(
                        res => {
                            return getWalletNextPath({
                                walletId: walletData.id,
                                coin: '123'
                            });
                        }
                    )
                    .subscribe(
                        res => {
                            assert.deepStrictEqual(res.body.err, errorCodes.ParamsError);
                            assert.deepInclude(res.body.data, {
                                "location": "body",
                                "param": "coin",
                                "msg": "Invalid value",
                                "value": "123"
                            });

                            done();
                        },
                        err => done(err)
                    )
            });

            it('request with invalid walletId', done => {
                let walletData = baseData.wallets[0];

                createWallet(walletData)
                    .flatMap(
                        res => {
                            return getWalletNextPath({
                                walletId: baseData.wallets[1].id,
                                coin: 'BTC'
                            });
                        }
                    )
                    .subscribe(
                        res => {
                            assert.deepStrictEqual(res.body.err, errorCodes.ParamsError);
                            assert.deepInclude(res.body.data, {
                                "location": "body",
                                "param": "walletId",
                                "msg": "Invalid value",
                                "value": baseData.wallets[1].id
                            });

                            done();
                        },
                        err => done(err)
                    )
            });

            it('DDOS request', done => {
                let walletData = baseData.wallets[0];

                createWallet(walletData)
                    .flatMap(
                        res => {
                            let promises = [];
                            for(let i=0; i<50; i++) {
                                promises.push(getWalletNextPath({
                                    walletId: walletData.id,
                                    coin: 'BTC'
                                }));
                            }

                            return Rx.Observable.zip(...promises);
                        }
                    )
                    .subscribe(
                        promises => {
                            assert.isNotEmpty(promises);
                            let lastRequest = last(promises);
                            assert.isTrue(!!lastRequest);
                            assert.deepStrictEqual(lastRequest.status, 429);
                            assert.deepStrictEqual(lastRequest.text, 'Too many requests, please try again later.');

                            done();
                        },
                        err => done(err)
                    )
            });

        });
    });

    describe('IntegrationTest', () => {
        it('work', (done) => {
            done(); // nothing to do
        });
    });
});