const {Product} = require('../models');
const Joi = require('joi');
const mongoose = require('mongoose'); 
/* const add = async (req, res) => {
    const data = {
        name: req.body.name,
        price: req.body.price ? req.body.price : 0,
        quantity: req.body.quantity,
    };
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        price: Joi.number().optional(),
        quantity: Joi.number().required()
    });
    const { error } = schema.validate(data);
    if (error) {
        return res.status(400).json(error.details[0].message);
    }
    try {
          const { name, price, quantity } = req.body;
        
          const resp =  await Product.create({name, price, quantity});
          return res.status(201).json({
            status: true,
            msg: 'Product added successfully!',
            item: resp
          });
    }
    catch(error) {
        return res.json({'status': 'false', 'message': error.message});
    }
} */

   /*  const add = async (req, res) => {
        // Prepare data to be validated
        const data = {
            name: req.body.name,
            price: req.body.price ? req.body.price : 0,
            quantity: req.body.quantity,
        };
    
        // Joi schema validation
        const schema = Joi.object({
            name: Joi.string().min(3).max(50).required().messages({
                'string.base': '"name" must be a string',
                'string.min': '"name" should have a minimum length of 3',
                'string.max': '"name" should have a maximum length of 50',
                'string.required': '"name" is required',
            }),
            price: Joi.number().optional().custom((value, helpers) => {
                 const price = value.toString();
                if (price.length < 2) {
                    return helpers.message('"price" must have at least 2 digits');
                }
                if (price.length > 4) {
                    return helpers.message('"price" should have a maximum of 4 digits');
                }
                return value;
            }).messages({
                'number.base': '"price" must be a number',
            }),
            quantity: Joi.number().required().messages({
                'number.base': '"quantity" must be a number',
                'any.required': '"quantity" is required',
            })
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
            // Destructure the body to get name, price, and quantity
            const { name, price, quantity } = req.body;
    
            // Create new product in the database
            const resp = await Product.create({ name, price, quantity });
    
            // Send success response
            return res.status(201).json({
                status: true,
                msg: 'Product added successfully!',
                item: resp, 
            });
        } catch (error) {
            console.error(error);  
    
            // Return a generic error response
            return res.status(500).json({
                status: false,
                msg: error.message || 'An error occurred while adding the product.', 
            });
        }
    };
     */
   
    const add = async (req, res) => {
        const { _id, name, price, quantity } = req.body;
    
        // Joi schema validation
        const schema = Joi.object({
            name: Joi.string().min(3).max(20).required().messages({
                'string.base': '"name" must be a string',
                'string.min': '"name" should have a minimum length of 3',
                'string.max': '"name" should have a maximum length of 50',
                'any.required': '"name" is required',
            }),
            price: Joi.number().optional().custom((value, helpers) => {
                const price = value.toString();
                if (price.length < 2) {
                    return helpers.message('"price" must have at least 2 digits');
                }
                if (price.length > 6) {
                    return helpers.message('"price" should have a maximum of 6 digits');
                }
                return value;
            }).messages({
                'number.base': '"price" must be a number',
            }),
            quantity: Joi.number().required().messages({
                'number.base': '"quantity" must be a number',
                'any.required': '"quantity" is required',
            }),
            _id: Joi.string().optional(),
        });
    
        // Validate the incoming request data
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: false,
                msg: error.details[0].message,
            });
        }
    
        try {
            // Check if _id exists in the request body (used for update)
            if (_id) {
                // Convert _id to a MongoDB ObjectId if it's a valid string
                const objectId = new mongoose.Types.ObjectId(_id);
                console.log("Updating product with ID:", objectId);
    
                // Perform the update operation if _id exists
                const updatedProduct = await Product.findByIdAndUpdate(objectId, { name, price, quantity }, { new: true });
    
                // Check if product exists for updating
                if (!updatedProduct) {
                    return res.status(404).json({
                        status: false,
                        msg: 'Product not found to update',
                    });
                }
    
                // Return the updated product data
                return res.status(200).json({
                    status: true,
                    msg: 'Product updated successfully!',
                    item: updatedProduct,
                });
            } else {
                // If no _id is provided, create a new product
                const newProduct = await Product.create({ name, price, quantity });
    
                // Return the newly created product
                return res.status(201).json({
                    status: true,
                    msg: 'Product added successfully!',
                    item: newProduct,
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: false,
                msg: error.message || 'An error occurred while adding or updating the product.',
            });
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
    add,
    getProduct,
    getProductById,
    deleteProduct
}