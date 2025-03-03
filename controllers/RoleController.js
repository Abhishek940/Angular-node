const {Role} = require('../models');
const Joi = require('joi');
const mongoose = require('mongoose');

    const addRole = async (req, res) => {
        // Prepare data to be validated
        const data = {
            name: req.body.name,
           // status: req.body.status,
           
        };

        const schema = Joi.object({
            name: Joi.string()
                .min(3)
                .max(50)
                .required()
                .strict() // Prevent type coercion
                .custom((value, helper) => {
                    // Check if the value is a string, and if it's a number, return an error
                    if (typeof value !== 'string') {
                        return helper.message('"name" must be a string');
                    }
                    return value; // If it's a string, continue validation
                })
                .messages({
                    'string.base': '"name" must be a string', // If it's not a string
                    'string.min': '"name" should have a minimum length of 3',
                    'string.max': '"name" should have a maximum length of 50',
                    'any.required': '"name" is required',
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
    // Ensure `name` is a string before passing to Joi
        /* if (typeof data.name !== 'string') {
            return res.status(400).json({
                status: false,
                msg: '"name" must be a string'
            });
        } */
        try {

            // Check if role already exists
            const existingRole = await Role.findOne({ name: data.name });
            if (existingRole) {
                return res.status(400).json({
                    status: false,
                    msg: 'Role already exists',
                });
            }
    
          // Destructure the body to get name, 
            const { name} = req.body;
            // Create new user in the database
            const resp = await Role.create({ 
                name,
              
            });
    
            // Send success response
            return res.status(201).json({
                status: true,
                msg: 'Role added successfully!',
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
    
 const getRoles = async (req, res) => {

     try {
         const page = parseInt(req.query.page) || 1; // default page 1 
         const limit = parseInt(req.query.limit) || 10; // default 10 items per page 
         const skip = (page - 1) * limit; // Calculate items to skip
 
         // Fetch role with pagination
         const roles = await Role.find()
                         .skip(skip)
                         .limit(limit);
 
         // If no roles are found
         if (!roles || roles.length === 0) {
             return res.status(404).json({
                 message: 'No Role found',
                 status: 'error',
                 data: []
             });
         }
 
         const totalCount = await Role.countDocuments();
         // Calculate total pages
         const totalPages = Math.ceil(totalCount / limit);
 
         // Return products along with pagination data
         return res.status(200).json({
             message: 'Roless retrieved successfully',
             status: 'Success',
             statusCode: 200,
             data:roles,
             pagination: {
                 totalCount,
                 totalPages,
                 currentPage: page,
                 pageSize: limit
             }
         });
     } catch (err) {
         return res.status(500).json({
             message: 'Error fetching roles',
             status: 'error',
             error: err.message
         });
     }
 };

 module.exports= {
    addRole,
    getRoles,
        
}