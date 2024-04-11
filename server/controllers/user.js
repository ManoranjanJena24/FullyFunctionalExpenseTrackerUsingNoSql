// const User = require('../models/user');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken')



// function generateHash(password) {
//     return bcrypt.hash(password, bcrypt.genSaltSync(8));//genSaltSync randomizes the password 8 times 
// }

// function generateAccessToken(id) { //changed
    
//     return jwt.sign({ userId: id }, process.env.TOKEN_SECRET)
  
// }

// exports.postCreateUser = (req, res, next) => {
//     const name = req.body.name;
//     const email = req.body.email;

//     generateHash(req.body.password)
//         .then(hashedPassword => {
//             return User.create({
//                 name: name,
//                 email: email,
//                 password: hashedPassword,
//                 totalexpense:0,
//             });
//         })
//         .then(result => {
//             console.log("Created User");
//             res.send("User Created Successfully");
//         })
//         .catch(err => {
//             console.error(err);

//             if (err.name === 'SequelizeUniqueConstraintError') {
//                 // Handle duplicate email error
//                 res.status(403).send('Request Failed With Status 403');
//             } else {
//                 res.status(500).send('Internal Server Error');
//             }
//         });
// };


// function validPassword(password, dbPassword) {
//     return new Promise((resolve, reject) => {
//         bcrypt.compare(password, dbPassword, (err, result) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(result);
//             }
//         });
//     });
// }

// exports.postLoginUser = (req, res, next) => {
//     const email = req.body.email;
//     const password = req.body.password;

//     User.findOne({
//         where: {
//             email: email,
//         }
//     })
//         .then((user) => {
//             if (!user) {
//                 return res.status(404).json({ success: false, message: 'User not found' });
//             }

//             validPassword(password, user.password)
//                 .then((isValid) => {
//                     if (isValid) {
//                         // req.session=user
//                         console.log(user.id)
//                         // console.log(req.session.name)
//                         isPremium = user.ispremiumuser
//                         return res.status(200).json({ success: true, token: generateAccessToken(user.id), isPremium: isPremium });
//                     } else {
//                         res.status(401).json({ success: false, message: 'Invalid password. User not authorized' });//changed
//                     }
//                 })
//                 .catch((error) => {
//                     console.error(error);
//                     res.status(500).json({ success: false, message: 'Internal Server Error' });
//                 });
//         })
//         .catch((error) => {
//             console.error(error);
//             res.status(500).json({ success: false, message: 'Internal Server Error' });
//         });
// };




const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.postRegisterUser = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            totalExpense: 0,
            totalSavings: 0,
            totalIncome: 0,
        });

        await newUser.save();
        res.json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.postLoginUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid password' });
        }
        console.log(process.env.TOKEN_SECRET)
        const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
            expiresIn: '1h',
        });

        res.json({ token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find().sort({ totalExpense: -1 });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};