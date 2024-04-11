// const Expense = require('../models/expense');
// const Salary = require('../models/salary')
// const User = require('../models/user')
// const sequelize = require('../utils/database')

// exports.postAddSalary = async (req, res, next) => {
//     const salary = req.body.salary
//     const userId = req.user.id;
//     const salaryamt = +salary

//     try {
//         // Start a transaction
//         const transaction = await sequelize.transaction();

//         // Create the salary
//         const createdSalary = await Salary.create({
//             salary: salary,
//             userId: userId // Assuming userId is a foreign key in Expense model
//         }, { transaction });

//         // Update user's totalsalary
//         const user = await User.findByPk(userId, { transaction });
//         if (!user) {
//             await transaction.rollback();
//             return res.status(404).json({ error: 'User not found' });
//         }

//         const totalsalary = user.totalsalary + salaryamt;
//         const savings = user.totalsavings + salaryamt;
//         await user.update({ totalsalary: totalsalary,totalsavings:savings }, { transaction });

//         // Commit the transaction
//         await transaction.commit();

//         res.json(createdSalary);
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };



// exports.getSalaries = (req, res, next) => {
//     console.log("inside GET salaries")
//     console.log('user id inbside getsalaries', req.user.id)

//     Salary.findAll({ where: { userId: req.user.id } }).then((salaries) => {//changes
//         console.log("fetched salaries")

//         res.json(salaries)

//     }).catch(err => {
//         console.log(err)
//     })
// };




const Salary = require('../models/salary');
const User = require('../models/user');

exports.postAddSalary = async (req, res, next) => {
    const  amount  = req.body.salary;
    const userId=req.user._id

    try {
        const createdSalary = new Salary({
            salary: Number(amount),
            user: req.user._id,
        });

        await createdSalary.save();
        await User.findByIdAndUpdate(userId, {
            $push: { salaries: createdSalary._id }
        });

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.totalIncome += Number(amount);
        user.totalSavings += Number(amount);
        user.totalSalary += Number(amount);

        await user.save();

        res.json(createdSalary);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getSalaries = async (req, res, next) => {
    const page = Number(req.query.page);
    const itemsPerPage = Number(req.query.limit);

    try {
        const totalItems = await Salary.countDocuments({ user: req.user._id });
        const salaries = await Salary.find({ user: req.user._id })
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        res.json({
            salaries,
            currentPage: page,
            hasNextPage: itemsPerPage * page < totalItems,
            nextPage: page + 1,
            hasPreviousPage: page > 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / itemsPerPage),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.postDeleteSalary = async (req, res, next) => {
    try {
        const salaryId = req.params.id;
        const salary = await Salary.findById(salaryId);

        if (!salary) {
            return res.status(404).json({ error: 'Salary not found' });
        }

        const salaryAmount = salary.amount;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await salary.remove();
        user.totalIncome -= salaryAmount;
        user.totalSavings -= salaryAmount;

        await user.save();
        res.send('Deleted');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAllSalariesReport = async (req, res, next) => {
    try {
        const salaries = await Salary.find({ user: req.user._id });
        res.json(salaries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};