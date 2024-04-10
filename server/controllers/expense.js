const Expense = require('../models/expense');
const User = require('../models/user')
const sequelize = require('../utils/database')
const AWS = require('aws-sdk')


// exports.postAddExpense = (req, res, next) => {
//     const amount = req.body.amount;
//     const description = req.body.description;
//     const category = req.body.category;
//     //  console.log(req.user)
//     const userId = req.user.id//changes
//     const expenseAmount = +amount;
//     console.log(typeof (expenseAmount))
//     const totalExpense = req.user.totalexpense + expenseAmount;

//     console.log('user id inside add expense', req.user)

//     console.log("Inside Add User")
//     req.user.createExpense({
//         amount: amount,
//         description: description,
//         category: category,
//     })
//         // .then(result => {
//         //     console.log("Created Expense");

//         //     res.json(result);
//         // })
//         .then(result => {
//             console.log("Created Expense");
//             // Find the user by primary key
//             User.findByPk(req.user.id)
//                 .then(user => {
//                     if (!user) {
//                         return res.status(404).json({ error: 'User not found' });
//                     }
//                     // Update totalExpense in the user table
//                     user.update({ totalexpense: totalExpense })
//                         .then(() => {
//                             console.log("Updated totalExpense in user table");
//                             res.json(result);
//                         })
//                         .catch(err => {
//                             console.log(err);
//                             res.status(500).json({ error: 'Internal Server Error' });
//                         });
//                 })
//                 .catch(err => {
//                     console.log(err);
//                     res.status(500).json({ error: 'Internal Server Error' });
//                 });
//         })
//         .catch(err => {
//             console.log(err);
//             res.status(500).json({ error: 'Internal Server Error' });
//         });
// };


exports.postAddExpense = async (req, res, next) => {
    const amount = req.body.amount;
    const description = req.body.description;
    const category = req.body.category;
    const userId = req.user.id;
    const expenseAmount = +amount;

    try {
        // Start a transaction
        const transaction = await sequelize.transaction();

        // Create the expense
        const createdExpense = await Expense.create({
            amount: amount,
            description: description,
            category: category,
            userId: userId // Assuming userId is a foreign key in Expense model
        }, { transaction });

        // Update user's totalExpense
        const user = await User.findByPk(userId, { transaction });
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ error: 'User not found' });
        }

        const totalExpense = user.totalexpense + expenseAmount;
        const savings = user.totalsavings - totalExpense;
        await user.update({ totalexpense: totalExpense, totalsavings: savings }, { transaction });

        // Commit the transaction
        await transaction.commit();

        res.json(createdExpense);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getAllExpenses = async (req, res, next) => {
    User.findAll({
        attributes: ['id', 'name', 'totalexpense'], order: [['totalexpense', 'DESC']]
    }).then(users => {
        res.json(users)
    }).catch(error => {
        console.error('Error fetching users with expenses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
};




exports.getExpenses = (req, res, next) => {
    console.log("inside GET users")
    console.log(req.query, 'queryyyyyyyyyyyyyyyyyyyyyyyyy')
    const page = Number(req.query.page); 
    const itemsPerPage=Number(req.query.limit)
    console.log('user id inbside getexpense', req.user.id)
    // req.user.getExpenses()..then((expenses) => { //method 2 to do line 38-43
    //     console.log("fetched Users")

    //     res.json(expenses)

    // })
    let totalItems;
    return Expense.count().then((total) => {
        totalItems = total

        Expense.findAll({ where: { userId: req.user.id }, offset: (page - 1) * itemsPerPage,limit:itemsPerPage },
        ).then((expenses) => {//changes
            console.log("fetched Users")

            res.json({
                expenses: expenses,
                currentPage: page,
                hasNextPage: itemsPerPage * page < totalItems,
                nextPage: page + 1 ,
                hasPreviousPage:page>1,
                previousPage: page - 1,
                lastPage:Math.ceil(totalItems/itemsPerPage)
            })

        }).catch(err => {
            console.log(err)
        })
    }).catch(() => {
        
    })

};

exports.postEditExpense = (req, res, next) => {
    const expenseId = req.body.id;
    const amount = req.body.amount
    const description = req.body.description
    const category = req.body.category


    Expense.findByPk(expenseId).then((expense) => {
        expense.amount = amount
        expense.description = description
        expense.category = category
        return expense.save();
    }).then((result) => {
        console.log("Updated")
        res.send('Updated Succesfully');
    }).catch((err) => {
        console.log(err)
    })
}


// exports.postDeleteExpense = async (req, res, next) => {
//     try {
//         console.log("inside Delete");
//         const expenseId = req.params.id;

//         // Find the expense by primary key
//         const expense = await Expense.findByPk(expenseId);

//         if (!expense) {
//             return res.status(404).json({ error: 'Expense not found' });
//         }

//         const expenseAmount = +expense.amount;

//         // Delete the expense
//         await expense.destroy();

//         // Calculate new totalExpense
//         const totalExpense = req.user.totalexpense - expenseAmount;

//         // Update totalExpense in the user table
//         const user = await User.findByPk(req.user.id);

//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         await user.update({ totalexpense: totalExpense });

//         console.log("Updated totalExpense in user table");
//         res.send('Deleted');
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };



exports.postDeleteExpense = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        console.log("inside Delete");
        const expenseId = req.params.id;

        // Find the expense by primary key
        const expense = await Expense.findByPk(expenseId, { transaction: t });

        if (!expense) {
            await t.rollback();
            return res.status(404).json({ error: 'Expense not found' });
        }

        const expenseAmount = +expense.amount;

        // Delete the expense
        await expense.destroy({ transaction: t });

        // Calculate new totalExpense
        const user = await User.findByPk(req.user.id, { transaction: t });

        if (!user) {
            await t.rollback();
            return res.status(404).json({ error: 'User not found' });
        }

        const totalExpense = req.user.totalexpense - expenseAmount;

        // Update totalExpense in the user table
        await user.update({ totalexpense: totalExpense }, { transaction: t });

        console.log("Updated totalExpense in user table");

        // Commit the transaction
        await t.commit();

        res.send('Deleted');
    } catch (err) {
        console.log(err);
        await t.rollback();
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.downloadExpenses = async (req, res, next) => {
    const expenses = await req.user.getExpenses()
    console.log(expenses)
    const stringifiedExpenses = JSON.stringify(expenses)
    const userId = req.user.id
    const fileName = `Expense${userId}/${new Date()}.txt`
    const fileUrl = await uploadToS3(stringifiedExpenses,fileName)
    res.status(200).json({
        fileUrl, success: true

    })

}

function uploadToS3(data, filename) {
    console.log('data', data)
    const BUCKET_NAME = process.env.BUCKET_NAME
    const IAM_USER_KEY = process.env.IAM_USER_KEY
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET

    let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
        // Bucket:BUCKET_NAME
    })
   
        var params = {
            Bucket: BUCKET_NAME,
            Key: filename,
            Body: data,
            ACL:'public-read'

    }
    return new Promise((resolve,reject) => {
        s3bucket.upload(params, (err, s3response) => {
            if (err) {
                console.log("Something Went Wrong", err)
                reject(err)
            }
            else {
                console.log(s3response)
                resolve(s3response.Location)

            }
        })
    })
      
 

}

exports.getAllExpensesReport = (req, res, next) => {
    console.log(req.user.id)

    Expense.findAll({ where: { userId: req.user.id } }).then((expenses) => {//changes
       

        res.json(expenses)

    }).catch(err => {
        console.log(err)
    })
};