const express = require('express');
const { signup, login } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes

//router.post('/login', login);

// Protected route example
/* router.get('/protected', authMiddleware, (req, res) => {
    return res.status(200).json({ status: true, msg: 'You accessed a protected route!', user: req.user });
}); */

module.exports = router;
