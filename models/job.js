const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//schema for the job object, the object contains, idNumber, name, description, location, address, workers, equipment, isCompleated, hectares and time stamp
//idNumber is unique and obligatory, name is also obligatory
const jobSchema = new Schema({
    
    idNumber: {
        type: Number,
        required: true,
        unique: true
    },
    
    name: {
      type: String,
      required: true
    },
    
    description: {
        type: String,
    },

    location: {
      type: String,
    },

    address: {
      type: String,
    },

    workers: {
      type: String,
    },

    client: {
      type: String,
    },

    equipment: {
      type: String,
    },

    isCompleted: {
      type: Boolean,
    },

    hectares: {
      type: Number,
    }
      

},{timestamps: true});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;



