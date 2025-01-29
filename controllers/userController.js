const {User} = require('../models');
const Joi = require('joi');
const mongoose = require('mongoose'); 
const jwt = require('jsonwebtoken');
    const addUser = async (req, res) => {
        // Prepare data to be validated
        const data = {
            name: req.body.name,
            mobile: req.body.mobile,
            email: req.body.email,
            password: req.body.password,
        };
    
        // Joi schema validation
        const schema = Joi.object({
            name: Joi.string().min(3).max(50).required().messages({
                'string.base': '"name" must be a string',
                'string.min': '"name" should have a minimum length of 3',
                'string.max': '"name" should have a maximum length of 50',
                'any.required': '"name" is required',
            }),
            mobile: Joi.number()
            .required()
            .custom((value, helpers) => {
                const mobile = value.toString();
                 if (mobile.length > 10) {
                    return helpers.message('Mobile number cannot be more than 10 digits');
                }
                return value;
            })
        
            .messages({
                'number.base': 'Mobile must be a number',
                'any.required': 'Mobile is required',
            }),
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': '"email" must be a valid email address',
                'any.required': '"email" is required',
            }),
            password: Joi.string().min(6).required().messages({
                'string.min': '"password" should have a minimum length of 6',
                'any.required': '"password" is required',
            }),
        });
    
        // Validate the data
        const { error } = schema.validate(data);
        if (error) {
            return res.status(400).json({
                status: false,
                msg: error.details[0].message,
            });
        }
    
        try {

            // Check if email or mobile already exists
            const existingEmail = await User.findOne({ email: data.email });
            if (existingEmail) {
                return res.status(400).json({
                    status: false,
                    msg: 'Email already exists',
                });
            }
    
            // Check if the mobile number already exists
            const existingMobile = await User.findOne({ mobile: data.mobile });
            if (existingMobile) {
                return res.status(400).json({
                    status: false,
                    msg: 'Mobile number already exists',
                });
            }
            // Destructure the body to get name, mobile, email, and password
            const { name, mobile, email, password } = req.body;
    
            // Create new user in the database
            const resp = await User.create({ name, mobile, email, password });
    
            // Send success response
            return res.status(201).json({
                status: true,
                msg: 'User added successfully!',
                item: resp,
            });
        } catch (error) {
            console.error(error);
    
            // Return a generic error response
            return res.status(500).json({
                status: false,
                msg: error.message || 'An error occurred while adding the user.',
            });
        }
    };
    
 
    const login = async (req, res) => {

        const { email, password } = req.body;
    
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ 
                    status: false,
                    msg: 'Invalid credentials' });
               }
    
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(400).json({ 
                    status: false,
                    msg: 'Invalid credentials' });
            }
    
            // Generate JWT token
            const token = jwt.sign({ 
                userId: user._id,
                email: user.email
              },
                process.env.JWT_SECRET,
                { expiresIn: '1h' } 
            );
    
            return res.status(200).json({
                status: true,
                msg: 'Login successful',
                name:user.name,
                mobileNo:user.mobile,
                email:user.email,
                token,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: false, msg: 'Server error' });
        }
    };
    
    

const deleteProduct = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (deletedProduct) {
            return res.status(200).json({
                 msg: 'Product deleted successfully'
            });

        } else {
            return res.status(404).json({ 
                msg: 'Product not found'
            
            });
        }
    } catch (err) {
        return res.status(500).json({
             msg: 'Error deleting product', error: err.msg
            
            });
    }

};
  

/* const getProuct = async (req, res) => {
    try {
        const product = await Product.find();
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        return res.status(200).json(product);
    } catch (err) {
        return res.status(500).json({ message: 'Error fetching product', error: err.message });
    }
}; */

const getProduct = async (req, res) => {
    
    try {
        const page = parseInt(req.query.page) || 1; // default page 1 
        const limit = parseInt(req.query.limit) || 10; // default 10 items per page 
        const skip = (page - 1) * limit; // Calculate  items to skip

        // Fetch products with pagination
        const products = await Product.find()
                        .skip(skip)
                        .limit(limit);

        // If no products are found
        if (!products || products.length === 0) {
            return res.status(404).json({
                message: 'No products found ',
                status: 'error',
                data: []
            });
        }

        const totalCount = await Product.countDocuments();
        // Calculate total pages
        const totalPages = Math.ceil(totalCount / limit);

        // Return products along with pagination data
        return res.status(200).json({
            message: 'Products retrieved successfully',
            status: 'Success',
            statusCode:200,
            data: products,
            pagination: {
                totalCount,
                totalPages,
                currentPage: page,
                pageSize: limit
            }
        });

    } catch (err) {
         return res.status(500).json({
            message: 'Error fetching products',
            status: 'error',
            error: err.message
        });
    }
};


const getProductById = async (req, res) => {
    try {
      const productId = req.body.id; // Get the product ID from the body
  
      // Ensure productId is provided
      if (!productId) {
        return res.status(400).json({
          message: 'Product ID is required',
          status: 'error',
          data: null
        });
      }
  
      // Fetch the product by its ID from the database
      const product = await Product.findById(productId);
  
      // If the product does not exist
      if (!product) {
        return res.status(404).json({
          message: 'Product not found',
          status: 'error',
          data: null
        });
      }
  
      // Return the product details if found
      return res.status(200).json({
        message: 'Product retrieved successfully',
        status: 'success',
        data: product
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error fetching product',
        status: 'error',
        error: error.message
      });
    }
  };
  


module.exports= {
    addUser,
    login,
    
}