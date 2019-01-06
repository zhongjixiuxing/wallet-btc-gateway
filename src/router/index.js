

const apiPrefix = '/v1';
module.exports = (app) => {
    app.use(apiPrefix + '/wallet', require('../controller/WalletCtrl'));
}