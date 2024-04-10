const path = require('path');

const express = require('express');


const purchaseController=require('../controllers/purchase')

const userAuthentication = require('../middleware/auth')

const router = express.Router();

// /users => GET


router.get('/premium-membership', userAuthentication.authenticate, purchaseController.purchasePremium);

router.get('/leaderboard', purchaseController.getAllExpenses)

router.post('/updateTransactionStatus', userAuthentication.authenticate, purchaseController.updateTransactionStatus);

router.post('/updateTransactionStatus/failed', userAuthentication.authenticate, purchaseController.changeTransactionStatus);



module.exports = router;
