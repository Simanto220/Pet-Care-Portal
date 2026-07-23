const jwt = require('jsonwebtoken');
const { secret } = require("../config/jwtSecret");

const jwtVerification = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer Token

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        console.log('User authenticated:', decoded);
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ error: 'User not Authenticated' });
};
  

module.exports = {jwtVerification, ensureAuthenticated};