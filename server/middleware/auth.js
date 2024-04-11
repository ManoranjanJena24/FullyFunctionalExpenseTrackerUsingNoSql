const jwt = require('jsonwebtoken')
const User = require('../models/user');

const authenticate = async(req, res, next) => {
    try {
        const token = req.header('Authorization');
        // console.log(token)
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET)
        const user = await User.findById(decodedToken.userId)
        if (!user) {
            return res.status(404).json({error:'User Not Found'})
        }
        // console.log('userId >>>>>',userId.userId)
        
            req.user = user;
            next()
      
    } catch (err) {
        console.log(err);
        return res.status(401).json({ success: false })
    }
}
module.exports = { authenticate }