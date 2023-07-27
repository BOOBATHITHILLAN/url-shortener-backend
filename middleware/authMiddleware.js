require('dotenv').config();
const jwt = require('jsonwebtoken');
const Secret_Key = process.env.Secret_Key



const authMiddleware = {
    verifyToken: (req, res, next) => {
        const token = req.headers.authorization;

        if(!token){
            return res.status(401).json({ message: 'Authentication failed,header' });
        }
        try {
            const decodedToken = jwt.verify(token, Secret_Key);
            req.userId = decodedToken.userId;
            next();
        } catch(error) {
            console.error('Error verifying token', error);
            return res.status(401).json({ message: 'Authentication failed,error' });
        }
    }
};

module.exports = authMiddleware;