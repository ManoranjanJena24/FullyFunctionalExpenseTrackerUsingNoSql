const Expense = require('../models/expense');
const User = require('../models/user');

exports.postAddExpense = async (req, res, next) => {
    const { amount, description, category } = req.body;
    const userId = req.user._id;

    try {
        const createdExpense = new Expense({
            amount: Number(amount),
            description: description,
            category: category,
            user: userId,
        });

        await createdExpense.save();
        await User.findByIdAndUpdate(userId, {
            $push: { expenses: createdExpense._id }
        });

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        console.log(typeof(amount))

        user.totalExpense += Number(amount);
        user.totalSavings -= Number(amount);

        await user.save();

        res.json(createdExpense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAllExpenses = async (req, res, next) => {
    try {
        const users = await User.find({}, 'id name totalExpense').sort({ totalExpense: -1 });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users with expenses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getExpenses = async (req, res, next) => {
    const page = Number(req.query.page);
    const itemsPerPage = Number(req.query.limit);
    const userId = req.user._id;

    try {
        const totalItems = await Expense.countDocuments({ user: userId });
        const expenses = await Expense.find({ user: userId })
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        res.json({
            expenses,
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

exports.postEditExpense = async (req, res, next) => {
    const { id, amount, description, category } = req.body;

    try {
        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        expense.amount = amount;
        expense.description = description;
        expense.category = category;

        await expense.save();
        res.send('Updated Successfully');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.postDeleteExpense = async (req, res, next) => {
    try {
        const expenseId = req.params.id;

        const expense = await Expense.findById(expenseId);
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        const expenseAmount = expense.amount;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await Expense.findByIdAndDelete(expenseId);
        user.totalExpense -= expenseAmount;
        user.totalSavings += expenseAmount;
        user.expenses = user.expenses.filter(expenseId => expenseId.toString() !== expense._id.toString());
        await user.save();
        res.send('Deleted');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.downloadExpenses = async (req, res, next) => {
    const expenses = await Expense.find({ user: req.user._id });

    const stringifiedExpenses = JSON.stringify(expenses);
    const userId = req.user.id;
    const fileName = `Expense${userId}/${new Date()}.txt`;

    try {
        const fileUrl = await uploadToS3(stringifiedExpenses, fileName);
        res.status(200).json({
            fileUrl,
            success: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

async function uploadToS3(data, filename) {
    const AWS = require('aws-sdk');
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

    const s3 = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
    });

    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read',
    };

    return new Promise((resolve, reject) => {
        s3.upload(params, (err, s3response) => {
            if (err) {
                console.error('Something went wrong:', err);
                reject(err);
            } else {
                resolve(s3response.Location);
            }
        });
    });
}

exports.getAllExpensesReport = async (req, res, next) => {
    try {
        const expenses = await Expense.find({ user: req.user._id });
        res.json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};