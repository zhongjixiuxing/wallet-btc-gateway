const {assert} = require('chai');
const {Logger} = require('../../src/services/Logger');
const Sinon = require('sinon');

let sinon;
// mocha test case example
describe('Common', function() {
    before(() => {});

    beforeEach(() => {
        // 重置内存中的数据
        Logger.logs = [];
        Logger.displayTtyCfg = 'error.debug.info.warn';

        sinon = Sinon.createSandbox();
    });

    afterEach(() => {
        sinon.restore();
    })

    describe('error', () => {
        it('work', done => {
            let event$$;
            event$$ = Logger.event$
                .subscribe(
                    res => {
                        event$$.unsubscribe();
                        assert.deepStrictEqual('error', res.level);
                        assert.deepStrictEqual('anxing123', res.args[0].message);
                        assert.deepStrictEqual(1, Logger.logs.length);
                        assert.deepStrictEqual('error', Logger.logs[0].level);
                        assert.deepStrictEqual('anxing123 []', Logger.logs[0].msg);

                        assert.ownProperty(Logger.logs[0], 'ts');
                        done();
                    },
                    err => done(err)
                );

            Logger.error(new Error('anxing123'));
        });

        it('ignore info level logs', done => {
            let displayToTTYSpy = sinon.spy(Logger, 'displayToTTY');
            Logger.displayTtyCfg = 'debug.info.warn';

            let event$$;
            event$$ = Logger.event$
                .subscribe(
                    res => {
                        event$$.unsubscribe();
                        assert.deepStrictEqual('error', res.level);
                        assert.deepStrictEqual('anxing123', res.args[0].message);
                        assert.deepStrictEqual(1, Logger.logs.length);
                        assert.deepStrictEqual('error', Logger.logs[0].level);
                        assert.deepStrictEqual('anxing123 []', Logger.logs[0].msg);

                        assert.ownProperty(Logger.logs[0], 'ts');
                        assert.deepStrictEqual(displayToTTYSpy.returnValues[0], false);
                        done();
                    },
                    err => done(err)
                );

            Logger.error(new Error('anxing123'));
        });
    })
});
