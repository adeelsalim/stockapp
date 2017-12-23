var mongoose = require("mongoose");

var warehouseSchema = mongoose.Schema({
    short: String,
    name: String,
    address: String,
    keeper: String,
    number: Number
    
});

module.exports = mongoose.model('Warehouse', warehouseSchema );