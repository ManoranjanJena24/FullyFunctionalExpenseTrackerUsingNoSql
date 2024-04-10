const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema = new Schema({
    paymentId: {
        type: String
    },
    orderId: {
        type: String,
        required: true
    },
    status: {
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Order', orderSchema)



// const Sequelize = require('sequelize')
// const sequelize = require('../utils/database')
// const Order = sequelize.define('order', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true,
//     },
//     paymentid: {
//         type: Sequelize.STRING,
//         // allowNull: false,

//     },
//     orderid: {
//         type: Sequelize.STRING,
//         allowNull: false,

//     },
//     status: {
//         type: Sequelize.STRING,
//         // allowNull: false,

//     }

// });

// module.exports = Order;



