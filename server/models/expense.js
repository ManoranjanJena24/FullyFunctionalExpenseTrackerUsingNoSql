const mongoose = require('mongoose')
const Schema = mongoose.Schema

const expenseSchema = new Schema({
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true // Enable timestamps to automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('Expense', expenseSchema)




