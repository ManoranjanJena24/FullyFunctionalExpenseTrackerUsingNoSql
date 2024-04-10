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
});

module.exports = mongoose.model('Salary', salarySchema)


// const Sequelize = require('sequelize')
// const sequelize = require('../utils/database')

// const Salary = sequelize.define('salary', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true,
//     },
//     salary: {
//         type: Sequelize.INTEGER,
//         // allowNull: false,

//     },

// });

// module.exports = Salary;