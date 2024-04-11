// const Razorpay = require('razorpay')
// const Order = require('../models/order')
// const User=require('../models/user')


// const purchasePremium = async (req, res, next) => {
//     console.log(process.env.RAZORPAY_KEY_ID, ' key ')
//     try {
//         var rzp = new Razorpay({
//             key_id: process.env.RAZORPAY_KEY_ID,
//             key_secret: process.env.RAZORPAY_KEY_SECRET
//         })
//         const amount = 2500
//         rzp.orders.create({
//             amount, currency: "INR"
//         }, (err, order) => {
//             if (err) {
//                 throw new Error(JSON.stringify(err))
//             }
//             req.user.createOrder({
//                 orderid: order.id,
//                 status: 'PENDING'
//             }).then(() => {
//                 return res.status(201).json({
//                     order,
//                     key_id: rzp.key_id
//                 })
//             }).catch((err) => {
//                 console.log(err)
//             })
//         })
//     }
//     catch (err) {
//         console.log(err)
//         res.status(403).json({
//             message: "Something Went Wrong",
//             error: err
//         })
//     }
// }

// const getAllExpenses = async (req, res, next) => {
//     User.findAll({
//         attributes: ['id', 'name', 'totalexpense'], order: [['totalexpense', 'DESC']]
//     }).then(users => {
//         res.json(users)
//     }).catch(error => {
//         console.error('Error fetching users with expenses:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     });
// };

// const updateTransactionStatus = async (req, res, next) => {
//     try {
//         const {
//             payment_id,
//             order_id
//         } = req.body

//         // const status = await fetchPaymentDetails(payment_id);

        
//         Order.findOne({
//             where: {
//                 orderid: order_id
//             }
//         }).then((order) => {
//             order.update({ paymentid: payment_id, status: 'SUCCESSFUL' }).then(() => {
//                 req.user.update({ ispremiumuser: true }).then(() => {
//                     return res.status(202).json({ success: true, message: 'TRANSCTION SUCCESSFULL' })
//                 }).catch(err => console.log(err))
//             }).catch(err => console.log(err))
//         })

//     }
//     catch (err) {
//         console.log(err)
//     }
// }

// const changeTransactionStatus = async (req, res, next) => {
//     try {
//         const {
//             order_id
//         } = req.body

//         // const status = await fetchPaymentDetails(payment_id);

//         console.log('request details of failed order>>>>>', order_id)
//         Order.findOne({
//             where: {
//                 orderid: order_id
//             }
//         }).then((order) => {
//             order.update({ status: 'FAILED' }).then(() => {
//                 req.user.update({ ispremiumuser: false }).then(() => {
//                     return res.status(202).json({ success: true, message: 'TRANSCTION FAILED' })
//                 }).catch(err => console.log(err))
//             }).catch(err => console.log(err))
//         })

//     }
//     catch (err) {
//         console.log(err)
//     }
// }

// module.exports = { purchasePremium, updateTransactionStatus, changeTransactionStatus, getAllExpenses }




const Razorpay = require('razorpay');
const Order = require('../models/order');
const User = require('../models/user');

exports.purchasePremium = async (req, res, next) => {
    const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const amount = 2500;

    try {
        const orderData = await rzp.orders.create({
            amount,
            currency: 'INR',
        });

        const order = new Order({
            paymentId: '',
            orderId: orderData.id,
            status: 'PENDING',
            user: req.user._id,
        });

        await order.save();

        res.status(201).json({
            order,
            key_id: rzp.key_id,
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateTransactionStatus = async (req, res, next) => {
    const orderId = req.body.order_id
    const paymentId = req.body.payment_id
    console.log(req.body)
    try {
        const order = await Order.findOne({ orderId });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.paymentId = paymentId;
        order.status = 'SUCCESSFUL';

        await order.save();

        const user = await User.findById(order.user);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isPremiumUser = true;

        await user.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating transaction status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.postDownloadLeaderBoard = async (req, res, next) => {
    try {
        const users = await User.find().sort({ totalExpense: -1 });

        // let html = '<table>';
        // html += '<tr><th>NAME</th><th>EXPENSE</th></tr>';

        // users.forEach(user => {
        //     html += `<tr><td>${user.name}</td><td>${user.totalExpense}</td></tr>`;
        // });

        // html += '</table>';

        res.status(200).json({ success: true,users });
    } catch (error) {
        console.error('Error downloading leaderboard:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.updateTransactionStatusFailed = async (req, res, next) => {
    try {
        // Extract order ID from the request body
        const { orderId } = req.body;

        // Find the order with the given order ID
        const order = await Order.findOne({ orderId });

        // If the order is not found, return a 404 error
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update the order status to 'FAILED'
        order.status = 'FAILED';
        await order.save();

        // Find the user associated with the order
        const user = await User.findById(order.user);

        // If the user is not found, return a 404 error
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Revert user's premium status to false
        user.isPremiumUser = false;
        await user.save();

        // Respond with success
        res.json({ success: true, message: 'Transaction status updated to FAILED' });
    } catch (error) {
        // Handle errors
        console.error('Error updating transaction status to FAILED:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};