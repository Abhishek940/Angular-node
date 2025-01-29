const jwt = require('jsonwebtoken');

const Authenticate = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
        return res.status(401).json({
            status: false, msg: 'Access denied. No token provided.' 
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ 
            status: false, msg: 'Invalid or expired token'
         });
    }
};

module.exports = Authenticate; 
