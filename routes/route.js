const express = require('express');
const router = express.Router();
const {productController, userController} = require('../controllers');
const Authenticate = require('../middleware/authenticateJWT'); 

router.post('/login',userController.login);
router.post('/addUser',userController.addUser);



// Apply authentication middleware to all  routes
router.use(Authenticate);

// Protected routes 
router.post('/add', productController.add);
router.post('/getProduct', productController.getProduct);
router.post('/getProductById', productController.getProductById);
router.delete('/products/:id', productController.deleteProduct);


module.exports = router;