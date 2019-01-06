const Mongoose = require('mongoose');
const Scheme = Mongoose.Schema;

// only support mnemonic type wallet
const types = {
    mnemonic:'mnemonic'
}

const Wallet = new Scheme({
    id: {type: String, unique: true, index: true},
    name: {type: String, default: 'wallet'},
    type: {type: String, default: types.mnemonic},
    // createdAt: {type: Date, default: Date.now()}
}, {
    autoIndex: true,
    timestamps: {
        createdAt: 'createdAt'
    }
});

Wallet.index({type: 1});
Wallet.types = types;

module.exports = Mongoose.model('Wallet', Wallet);