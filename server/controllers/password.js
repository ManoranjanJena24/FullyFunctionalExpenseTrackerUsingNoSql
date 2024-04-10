const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
var Sib = require('sib-api-v3-sdk');
const ForgotPassword = require('../models/forgotPassword')
const { v4: uuidv4 } = require('uuid');

function generateHash(password) {
    return bcrypt.hash(password, bcrypt.genSaltSync(8));//genSaltSync randomizes the password 8 times 
}
// let url = "http://localhost:3000"
let url = "http://54.80.220.110:3000"

exports.postForgotEmail = (req, res, next) => {
    const email = req.body.email;
    const client = Sib.ApiClient.instance
    const apiKey = client.authentications['api-key']
    apiKey.apiKey = process.env.SMTP_API_KEY
    User.findOne({
        where: {
            email: email
        },
        attributes: ['id']
    }).then((user) => {
        console.log(user.id, 'user forgot password')
        ForgotPassword.create({
            id: uuidv4(),
            userId: user.id,
            isActive: true
        }).then((response) => {
            console.log(response.id, 'Response ABCD')
            const tranEmailApi = new Sib.TransactionalEmailsApi()
            const sender = { email: 'a@gmail.com', name: 'EXPENSE TRACKER' } //change the name toour appname afterwards
            const receivers = [{
                email: email
            }]
            tranEmailApi.sendTransacEmail({
                sender, to: receivers, subject: "Reset the password link",
                textContent: `this is your reset password link  ${url}/password/resetpassword/${response.id}`
            }).then(() => {
                console.log("Mail Send")
                res.json({ email: email })
            }).catch((err) => {
                console.log(err)
            })

        }).catch((err) => {
            console.log(err)
        })
    }).catch((err) => {
        console.log(err)
        res.json({
            message: 'User Does Not Exist. Check The Entered Mail Id Or Sign Up Instead'
        })
    })

    

};

exports.getResetPassword = async (req, res) => {
    const requestId = req.params.requestId;

    try {
        // Retrieve the request from the database
        const forgotPasswordRequest = await ForgotPassword.findOne({
            where: {
                id: requestId,
                isActive: true // Ensure the request is active
            }
        });

        if (forgotPasswordRequest) {
            // Return a form to update the password
            res.render('resetPasswordForm', { requestId });
        } else {
            // Request not found or not active
            res.status(404).send('Reset password request not found or expired.');
        }
    } catch (error) {
        console.error('Error handling reset password request:', error);
        res.status(500).send('Internal server error.');
    }
};

// {
//     newPassword: '123456789',
//         requestId: 'c0cbe012-b9bf-473d-9042-10e443655c2c'
// }

exports.postResetPassword = (req, res, next) => {
    console.log(req.body, 'Inside Post Reset')
    let userId;
    ForgotPassword.findOne({
        where: { id: req.body.requestId }
    }).then((details) => {
        console.log(details.userId)  
        userId=details.userId
    })
    
    ForgotPassword.update({
        isActive:false
    },{
        where: { id: req.body.requestId }
    }, {
        attributes:['userId']
    }
    ).then((forgotpassword) => {
        generateHash(req.body.newPassword)
            // console.log(forgotpassword[1][0],'Updated Password')
            .then(hashedPassword => {
                User.update({
                    password: hashedPassword,
                    
                }, {
                    where: {
                        id: userId
                    }
                }).then(() => {
                    res.json({
                       message:'Password Updated Successfully'
                   }) 
                });
            })
    }).catch((err) => {
        console.log(err)
    })
    

}