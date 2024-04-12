const express = require('express');
// const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const sequelize = require('./utils/database')
var Sib = require('sib-api-v3-sdk');
// const sib = new Sib()
const fs = require('fs')
const path = require('path');


const User = require('./models/user')
const Expense = require('./models/expense')
const Order = require('./models/order')
const ForgotPassword = require('./models/forgotPassword')
const Salary = require('./models/salary')


const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
const cors = require('cors')

app.use(morgan('combined', { stream: accessLogStream }))

const userRoutes = require('./routes/user')
const expenseRoutes = require('./routes/expense')
const purchaseRoutes = require('./routes/purchase')
const passwordRoutes = require('./routes/password')
const salaryRoutes = require('./routes/salary')

app.use(bodyParser.json({ extended: false }));
app.use(cors())

app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', path.join(__dirname, 'views'));



app.use('/user', userRoutes);
app.use('/expense', expenseRoutes)
app.use('/purchase', purchaseRoutes)
app.use('/password', passwordRoutes)
app.use('/salary', salaryRoutes)

app.use((req, res, next) => {
    console.log('url>>>>>>>', req.url)
    res.sendFile(path.join(__dirname, `public/${req.url}`))

})


// Expense.belongsTo(User)
// User.hasMany(Expense)
// Order.belongsTo(User)
// User.hasMany(Order)
// ForgotPassword.belongsTo(User)
// User.hasMany(ForgotPassword)
// Salary.belongsTo(User)
// User.hasMany(Salary)




mongoose.connect('mongodb+srv://Sharpner:sharpner123@cluster0.hvfvrv3.mongodb.net/FullyFunctionalExpenseTracker?retryWrites=true&w=majority')
    .then(() => {
        console.log('Connected to database')
        app.listen(3000)
    }).catch((err) => {
        console.log(err)
    })

// sequelize.sync({
//     // force: true  //these should not be done in production becoz we donot want to overwrite the table everytime we run
//     // alter:true
// })
// app.listen(3000)