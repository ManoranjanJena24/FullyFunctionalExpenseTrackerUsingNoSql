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

// exports.postDownloadLeaderBoard = async (req, res, next) => {
//     try {
//         const users = await User.find().sort({ totalExpense: -1 });
//         let expenses=[]
//         users.forEach((user) => {
//             console.log(user.expenses)
//         })

//         res.status(200).json({ success: true,users });
//     } catch (error) {
//         console.error('Error downloading leaderboard:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

exports.postDownloadLeaderBoard = async (req, res, next) => {
    try {
        // Find all users and sort them by totalExpense in descending order
        const users = await User.find()
            .sort({ totalExpense: -1 })
            .select('name totalExpense'); // Only select the fields we need: name and totalExpense

        // Map the list of users to include only name and totalExpense
        const leaderBoardData = users.map(user => ({
            name: user.name,
            totalExpense: user.totalExpense
        }));

        // Send the leaderboard data as a JSON response
        res.status(200).json({ success: true, data: leaderBoardData });
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