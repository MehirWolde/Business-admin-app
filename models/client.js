const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const clientSchema = new Schema({
    
    idNumber: {
        type: Number,
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true
    },

    phoneNumber: {
        type: String,
    },
    
    email: {
        type: String,
    },
    
    notes: {
        type: String,
    }

});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;