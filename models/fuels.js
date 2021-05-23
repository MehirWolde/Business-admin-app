const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fuelSchema = new Schema({
    idNumber: {
        type: Number,
        required: true,
        unique: true
    },
    
    type: {
      type: String,
    },
    
    liter: {
        type: Number,
        required: true
    },

    fuelTanker: {
      type: String,
      required: true
    },

    vehicle: {
      type: String,
      required: true
    },

    worker: {
      type: String,
      required: true
    },

    notes: {
      type: String,
    }

},{timestamps: true});

const Fuel = mongoose.model('Fuel', fuelSchema);

module.exports = Fuel;