
var mongoose = require("mongoose");


var deliveryOrderSchema = mongoose.Schema({
    date: { type: Date, default: Date.now },
    do_nbr: Number,
    buyer: String,
    broker: String,
    validity: String,
    modeOfPayment: String,
    bag: Number,
    rate: String
    /*notes: [
        "سلامتی کونسل کی تمام قراردادوں پربلا امتیازعملدرآمد کیا جائے، ملیحہ لودھی",
        "سعودی عرب کو لاحق خطرات امریکا کو درپیش خطرات کے مترادف ہیں،امریکی صدر",
        "سندھ ہائی کورٹ میں کراچی کے علاقے گلستانِ جوہرمیں "
        
        ]*/
    
});





module.exports = mongoose.model('DeliveryOrder', deliveryOrderSchema);