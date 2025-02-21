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


// Generate Access Token
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email }, // payload
        process.env.JWT_SECRET, // secret key
        { expiresIn: '15m' } //  15 minutes
    );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email }, // payload
        process.env.JWT_REFRESH_SECRET, // secret key for refresh token
        { expiresIn: '7d' } //  7 days
    );
};

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Bearer <token>
    
    if (!token) {
        return res.status(401).json({ msg: 'No token provided' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // If the token is valid, attach the decoded data to the request object
        req.user = decoded;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Token has expired' });
        } else {
            return res.status(403).json({ msg: 'Invalid token' });
        }
    }
}

module.exports = { 
    Authenticate,
    generateAccessToken,
    generateRefreshToken,
    verifyToken 
};


