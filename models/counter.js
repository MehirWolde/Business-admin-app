const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const counterSchema = new Schema({
    idNumber: {
        type: Number,
        required: true,
        unique: true
    }
})

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;