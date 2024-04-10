const path = require('path');

const express = require('express');

const salaryController = require('../controllers/salary');

const userAuthentication = require('../middleware/auth')

const router = express.Router();

// // /users => GET
// router.get('/get-expenses',userAuthentication.authenticate, expenseController.getExpenses);

// router.get('/get-all-expenses', expenseController.getAllExpenses);

router.post('/add-salary', userAuthentication.authenticate, salaryController.postAddSalary);

// router.delete('/delete-expense/:id', userAuthentication.authenticate, expenseController.postDeleteExpense);

// router.post('/edit-expense', expenseController.postEditExpense);
router.get('/get-salaries', userAuthentication.authenticate, salaryController.getSalaries);//cahnges


module.exports = router;