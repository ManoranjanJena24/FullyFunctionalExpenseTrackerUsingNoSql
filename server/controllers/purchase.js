const Razorpay = require('razorpay')
const Order = require('../models/order')
const User=require('../models/user')

// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET
// });

const purchasePremium = async (req, res, next) => {
    console.log(process.env.RAZORPAY_KEY_ID, ' key ')
    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })
        const amount = 2500
        rzp.orders.create({
            amount, currency: "INR"
        }, (err, order) => {
            if (err) {
                throw new Error(JSON.stringify(err))
            }
            req.user.createOrder({
                orderid: order.id,
                status: 'PENDING'
            }).then(() => {
                return res.status(201).json({
                    order,
                    key_id: rzp.key_id
                })
            }).catch((err) => {
                console.log(err)
            })
        })
    }
    catch (err) {
        console.log(err)
        res.status(403).json({
            message: "Something Went Wrong",
            error: err
        })
    }
}

const getAllExpenses = async (req, res, next) => {
    User.findAll({
        attributes: ['id', 'name', 'totalexpense'], order: [['totalexpense', 'DESC']]
    }).then(users => {
        res.json(users)
    }).catch(error => {
        console.error('Error fetching users with expenses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
};


// const fetchPaymentDetails = async (paymentId) => {
//     try {
//         const payment = await razorpay.payments.fetch(paymentId);
//         return payment.status;
//     } catch (error) {
//         console.error('Error fetching payment details:', error);
//         throw error;
//     }
// };

const updateTransactionStatus = async (req, res, next) => {
    try {
        const {
            payment_id,
            order_id
        } = req.body

        // const status = await fetchPaymentDetails(payment_id);

        
        Order.findOne({
            where: {
                orderid: order_id
            }
        }).then((order) => {
            order.update({ paymentid: payment_id, status: 'SUCCESSFUL' }).then(() => {
                req.user.update({ ispremiumuser: true }).then(() => {
                    return res.status(202).json({ success: true, message: 'TRANSCTION SUCCESSFULL' })
                }).catch(err => console.log(err))
            }).catch(err => console.log(err))
        })

    }
    catch (err) {
        console.log(err)
    }
}

const changeTransactionStatus = async (req, res, next) => {
    try {
        const {
            order_id
        } = req.body

        // const status = await fetchPaymentDetails(payment_id);

        console.log('request details of failed order>>>>>', order_id)
        Order.findOne({
            where: {
                orderid: order_id
            }
        }).then((order) => {
            order.update({ status: 'FAILED' }).then(() => {
                req.user.update({ ispremiumuser: false }).then(() => {
                    return res.status(202).json({ success: true, message: 'TRANSCTION FAILED' })
                }).catch(err => console.log(err))
            }).catch(err => console.log(err))
        })

    }
    catch (err) {
        console.log(err)
    }
}

module.exports = { purchasePremium, updateTransactionStatus, changeTransactionStatus, getAllExpenses }