var mongoose = require("mongoose");

var stockSchema = mongoose.Schema({
    snbr: Number,
    lot: String, 
    cb: {type: String, default:"B"},
    pkgs: Number,
    wpkgs: Number,
    grade: String,
    garden: String,
    kgs: Number,
    rate: Number,
    wh: String,
    ac: Number,
    bkgs: Number,
    bpkgs: Number,
    date: { type: Date, default: Date.now },
    deliveryOrder: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryOrder"
        }
    ]
});

module.exports = mongoose.model('Stock', stockSchema );