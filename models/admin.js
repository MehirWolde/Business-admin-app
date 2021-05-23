const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    
    idNumber: {
        type: Number,
        required: true,
        unique: true
    },
    
    name: {
      type: String,
      required: true
    },
    
    username: {
        type: String,
        required: true,
        unique: true
      },

      password: {
        type: String,
        required: true
      },

      phoneNumber: {
        type: Number,
      },

      email: {
        type: String,
      },

      notes: {
        type: String,
      },
      

},{timestamps: true});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;



