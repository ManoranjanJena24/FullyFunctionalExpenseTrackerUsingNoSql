const Expense = require('../models/expense');
const Salary = require('../models/salary')
const User = require('../models/user')
const sequelize = require('../utils/database')

exports.postAddSalary = async (req, res, next) => {
    const salary = req.body.salary
    const userId = req.user.id;
    const salaryamt = +salary

    try {
        // Start a transaction
        const transaction = await sequelize.transaction();

        // Create the salary
        const createdSalary = await Salary.create({
            salary: salary,
            userId: userId // Assuming userId is a foreign key in Expense model
        }, { transaction });

        // Update user's totalsalary
        const user = await User.findByPk(userId, { transaction });
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ error: 'User not found' });
        }

        const totalsalary = user.totalsalary + salaryamt;
        const savings = user.totalsavings + salaryamt;
        await user.update({ totalsalary: totalsalary,totalsavings:savings }, { transaction });

        // Commit the transaction
        await transaction.commit();

        res.json(createdSalary);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



exports.getSalaries = (req, res, next) => {
    console.log("inside GET salaries")
    console.log('user id inbside getsalaries', req.user.id)

    Salary.findAll({ where: { userId: req.user.id } }).then((salaries) => {//changes
        console.log("fetched salaries")

        res.json(salaries)

    }).catch(err => {
        console.log(err)
    })
};