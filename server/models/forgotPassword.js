
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



// const Sequelize = require('sequelize');
// const { v4: uuidv4 } = require('uuid');
// const sequelize = require('../utils/database');

// const ForgotPassword = sequelize.define('forgotpassword', {
//     id: {
//         type: Sequelize.UUID,
//         defaultValue: Sequelize.UUIDV4,
//         allowNull: false,
//         primaryKey: true,
//     },
//     userId: {
//         type: Sequelize.INTEGER,
//     },
//     isActive: {
//         type: Sequelize.BOOLEAN,
//         allowNull: false,
//     }
// });

// module.exports = ForgotPassword;
