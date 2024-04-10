const path = require('path');

const express = require('express');

const expenseController = require('../controllers/expense'); //change

const userAuthentication=require('../middleware/auth')

const router = express.Router();

// /users => GET
router.get('/get-expenses',userAuthentication.authenticate, expenseController.getExpenses);
router.get('/get-all-expenses', expenseController.getAllExpenses);
router.get('/get-expenses-report', userAuthentication.authenticate, expenseController.getAllExpensesReport);

router.post('/add-expense', userAuthentication.authenticate, expenseController.postAddExpense);

router.delete('/delete-expense/:id', userAuthentication.authenticate, expenseController.postDeleteExpense);

router.post('/edit-expense', expenseController.postEditExpense);




module.exports = router;
