const mongoose = require('mongoose')
const Schema = mongoose.Schema

const salarySchema = new Schema({
    salary: {
        type: Number,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true // Enable timestamps to automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('Salary', salarySchema)
