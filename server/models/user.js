const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isPremiumUser: {
        type: Boolean,
        default: false
    },
    totalExpense: {
        type: Number,
        default: 0
    },
    totalSalary: {
        type: Number,
        default: 0
    },
    totalSavings: {
        type: Number,
        default: 0
    },
    expenses: [{
        type: Schema.Types.ObjectId,
        ref: 'Expense'
    }],
    orders: [{
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }],
    forgotPasswords: [{
        type: Schema.Types.ObjectId,
        ref: 'ForgotPassword'
    }],
    salaries: [{
        type: Schema.Types.ObjectId,
        ref: 'Salary'
    }]
});

module.exports = mongoose.model('User', userSchema)
