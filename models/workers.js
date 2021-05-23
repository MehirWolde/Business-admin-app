const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workerSchema = new Schema({
    
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
    required: true
  },

  password: {
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

},{timestamps: true});

const Worker = mongoose.model('Worker', workerSchema);

module.exports = Worker;