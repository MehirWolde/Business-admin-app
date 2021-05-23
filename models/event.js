const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    
    idNumber: {
        type: Number,
        required: true,
        unique: true
    }, 
    
    worker: {
      type: String,
      required: true
    },
    
    job: {
        type: String,
        required: true
    },
    
    jobName: {
      type: String,
      required: true
    },

    startTime: {
        type: String,
        required: true
    },

    endTime: {
        type: String,
        required: true
    },

    hours: {
      type: Number,
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    equipment: {
        type: String,
    },

    hectares: {
        type: Number,
    },

    items: {
        type: String,
      },

    notes: {
      type: String,
    }

},{timestamps: true});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;