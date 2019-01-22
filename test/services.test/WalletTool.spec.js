const assert = require('assert');
const Mongoose = require('mongoose');
const sinon = require('sinon');
const {clearDatabase} = require('../tool/tool');
const {createWallet, getWallet, getWalletNextPath, requestBtcNode} = require('../tool/request');
const {baseData} = require('../tool/data');
const {WalletTool} = require('../../src/services/WalletTool');
const superagent = require('superagent');
const {errorCodes} = require('../../src/services/common');
const superagentMock = require('superagent-mock');
const {superagetnMockCfg, btcRpcConfig, resetResonseConfig} = require('../tool/superagent-mock.config');
const {Logger} = require('../../src/services/Logger');

let app;

// mocha test case example
describe('Common', function() {
    let Wallet, WalletCoin, sandbox, RateLimiter, superagentMockInstance;
    before(() => {
        return new Promise((resolve, reject) => {
            require('../../bin/www')
                .then(res => {
                    app = res;
                    global.app = app;
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
        Logger.logs = [];
        Logger.displayTtyCfg = 'error.debug.info.warn';

        // refresh mock instance
        superagentMockInstance.unset();
        resetResonseConfig();
        superagentMockInstance = superagentMock(superagent, superagetnMockCfg);

        sandbox.restore();
        await clearDatabase();
    });

	describe('nextPath', () => {
		it ('work', done => {
			let walletData = baseData.wallets[0];

			createWallet(walletData)
				.flatMap(res => getWalletNextPath({walletId: walletData.id, coin: 'BTC'}))
				.flatMap(res => WalletCoin.findOne().populate('wallet'))
				.flatMap(res => WalletTool.nextPath(res))
				.subscribe(
					res => {
						assert.deepStrictEqual(res, "m/44'/1'/0'/0/1");
						done();
					},
					err => done(err)
				)
		});

		it('invalid coin[XXX]', done => {
            let walletData = baseData.wallets[0];

            createWallet(walletData)
                .flatMap(res => getWalletNextPath({walletId: walletData.id, coin: 'BTC'}))
                .flatMap(res => WalletCoin.findOne())
                .flatMap(
                	res => {
                		res.coin = 'XXX';
                		return WalletTool.nextPath(res)
                	}
                )
                .subscribe(
                    res => done(res),
                    err => {
                    	assert.deepStrictEqual(err.message, 'un-support coin: XXX');
                    	done();
					}
                )
		});
	});

	describe('importWallet', () => {
		it('work', done => {
            let walletData = baseData.wallets[0];

            createWallet(walletData)
                .flatMap(res => getWalletNextPath({walletId: walletData.id, coin: 'BTC'}))
                .subscribe(
                    res => {
                        assert.deepStrictEqual(res.body.data.path, "m/44'/1'/0'/0/0");
                        done();
                    },
                    err => done(err)
                )
		});

		it('imported', done => {
            let walletData = baseData.wallets[0];
            btcRpcConfig.createwallet.currentRes = 'alreadyExists';
            createWallet(walletData)
                .flatMap(res => getWalletNextPath({walletId: walletData.id, coin: 'BTC'}))
                .subscribe(
                    res => {
                        assert.deepStrictEqual(res.body.err, errorCodes.OK);
                        assert.deepStrictEqual(true, Logger.logs.length > 0);

                        // check logs
                        let hasFlag = false;
                        for(let i=0; i<Logger.logs.length; i++) {
                            let log = Logger.logs[i];
                            if (log.level !== 'warn') {
                                continue;
                            }

                            if (log.msg.indexOf(`[coin/next_path] WalletExists [{"id":"${walletData.id}"}]`) !== -1) {
                                hasFlag = true;
                                break;
                            }
                        }
                        assert.deepStrictEqual(true, hasFlag);

                        done();
                    },
                    err => done(err)
                )
        });
	})
});
