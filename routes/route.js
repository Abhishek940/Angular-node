const express = require('express');
const router = express.Router();
const {productController, userController, roleController} = require('../controllers');
const {Authenticate} = require('../middleware/authenticateJWT'); 

router.post('/login',userController.login);
router.post('/addUser',userController.addUser);
router.post('/forgotPass',userController.forgotPassword);
router.post('/reset-password',userController.resetPassword);
router.post('/refresh-token',userController.refreshToken);
router.post('/logout', userController.logout);
router.post('/getRole', roleController.getRoles);
// Apply authentication middleware to all  routes
router.use(Authenticate);

// Protected routes 
router.post('/add', productController.add);
router.post('/getProduct', productController.getProduct);
router.post('/getProductById', productController.getProductById);
router.post('/products/:id', productController.deleteProduct);
router.post('/addRole', roleController.addRole);
router.post('/getUserData', userController.getUserData);

module.exports = router;