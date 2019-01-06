
const config = {
    port: process.env.PORT || 3000,
    mongodbUri: process.env.MONGO_URI || 'mongodb://localhost/btc-gateway',
    wallet: {
        btc: {
            url: process.env.BTC_RPC_URI || 'http://localhost:18080/', // service url
        }
    }
};


module.exports = config;