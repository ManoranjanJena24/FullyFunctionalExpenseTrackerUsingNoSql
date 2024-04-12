const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Sib = require('sib-api-v3-sdk');
const ForgotPassword = require('../models/forgotPassword');
const { v4: uuidv4 } = require('uuid');

// const url = "http://54.80.220.110:3000";
let url = "http://localhost:3000"

exports.postForgotEmail = async (req, res, next) => {
    const email = req.body.email;
    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications['api-key'];
    apiKey.apiKey = process.env.SMTP_API_KEY;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const forgotPasswordRequest = new ForgotPassword({
            userId: user._id,
            isActive: true,
        });

        await forgotPasswordRequest.save();

        const tranEmailApi = new Sib.TransactionalEmailsApi();
        const sender = { email: 'a@gmail.com', name: 'EXPENSE TRACKER' }; // Change the name to your app name
        const receivers = [{ email }];

        await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: "Reset the password link",
            textContent: `This is your reset password link: ${url}/password/resetpassword/${forgotPasswordRequest._id}`,
        });

    res.json({ email });
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
}
};

exports.getResetPassword = async (req, res) => {
    const requestId = req.params.requestId;

    try {
        const forgotPasswordRequest = await ForgotPassword.findOne({
            _id: requestId,
            isActive: true,
        });

        if (forgotPasswordRequest) {
            // Render a form or send data to frontend to update the password
            res.render('resetPasswordForm', { requestId });
        } else {
            res.status(404).send('Reset password request not found or expired.');
        }
    } catch (error) {
        console.error('Error handling reset password request:', error);
        res.status(500).send('Internal server error.');
    }
};

exports.postResetPassword = async (req, res, next) => {
    const { requestId, newPassword } = req.body;

    try {
        const forgotPasswordRequest = await ForgotPassword.findOne({
            _id: requestId,
            isActive: true,
        });

        if (!forgotPasswordRequest) {
            return res.status(404).json({ error: 'Password reset request not found' });
        }

        forgotPasswordRequest.isActive = false;
        await forgotPasswordRequest.save();

        const hashedPassword = await bcrypt.hash(newPassword, 8);
        await User.findByIdAndUpdate(
            forgotPasswordRequest.userId,
            { password: hashedPassword },
        );

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};