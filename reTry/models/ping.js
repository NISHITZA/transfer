const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PingSchema=new Schema({
    currentData: { 
        type:Number 
    }
})

const Ping=mongoose.model('Ping',PingSchema);

module.exports = Ping;
