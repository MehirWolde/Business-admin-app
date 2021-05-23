const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//This is not used for now! Use equipment schema instead!


const vehicleSchema = new Schema({
    
    idNumber: {
        type: Number,
        required: true,
        unique: true
      },
    
    name: {
      type: String,
      required: true
    },
    
    regNumber: {
        type: String,
        required: true
      },

      notes: {
        type: String,
      }

},{timestamps: true});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;