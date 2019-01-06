const Mongoose = require('mongoose');
const Scheme = Mongoose.Schema;

const Coins = {
    BTC: 'BTC',
    ETH: 'ETH',
    EOS: 'EOS',
    BCH: 'BCH'
};

const WalletCoin = new Scheme({
    wallet: {
        type: Scheme.Types.ObjectId,
        required: true,
        ref: 'Wallet'
    },
    coin: {type: String, default: 'BTC'},
    path: {type: String}
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

WalletCoin.Coins = Coins;
WalletCoin.index({wallet: 1, coin:1}, {unique: true});

module.exports = Mongoose.model('WalletCoin', WalletCoin);