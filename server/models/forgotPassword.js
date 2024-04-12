
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const forgotPasswordSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('ForgotPassword', forgotPasswordSchema)


