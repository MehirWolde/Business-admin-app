const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const equipmentSchema = new Schema({
    
    idNumber: {
        type: Number,
        required: true,
        unique: true
    },
    
    name: {
      type: String,
      required: true
    },
    
    serialNumber: {
      type: String,
    },

    isTanker: {
      type: Boolean
    },

    notes: {
      type: String,
    },
      
},{timestamps: true});

const Equipment = mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment;



