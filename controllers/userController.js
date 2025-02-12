const {User} = require('../models');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose'); 
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

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
            name: Joi.string().min(2).max(50).required().messages({
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
                    msg: 'Invalid credentialssss' });
               }
               
             
           const isMatch = await bcrypt.compare(password, user.password);
            console.log('match',isMatch);
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
                password:user.password,
                token,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: false, msg: 'Server error' });
        }
    };
    
  // forgot password
    
  const forgotPassword = async (req, res) => {
    
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a password reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // Set an expiration time for the token (1 hour from now)
       // const resetTokenExpiration = Date.now() + 3600000; // 1 hour
       const resetTokenExpiration = Date.now() + 24 * 60 * 60 * 1000; // 1 day in milliseconds

        // Save the token and expiration in the user object
        user.resetToken = resetToken;
        user.resetTokenExpiration = resetTokenExpiration;
        
        // Save the updated user to the database
        await user.save();  // token is saved to the database!
        console.log("Updated user:", user);
        // Send email with reset link
        const transporter = nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io', // Mailtrap SMTP host
            port: 2525, 
            auth: {
                user: '64ee6f1dc43e63',
                pass: 'f0f55f60fb7c5a',
            },
        });

        const resetLink = `http://localhost:4200/reset-password/${resetToken}`;

        const mailOptions = {
            from: 'abhishek.k@csm.tech',
            to: email,
            subject: 'Password Reset Request',
            html: `
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <p><a href="${resetLink}">Reset Password</a></p>
             `, 
        };
        
        // Send the email using the transporter
        await transporter.sendMail(mailOptions);
        return res.status(200).json({
             message: 'Password reset link sent' 
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            message: 'Failed to send email, server error' 
        });
    }
};



/* const resetPassword = async (req, res) => {
    const { resetToken, password } = req.body;

    try {
        // Find the user with the reset token and check if it has expired
        const user = await User.findOne({
            resetToken,
            resetTokenExpiration: { $gt: Date.now() }, // Check if the reset token hasn't expired
        });

        if (!user) {
            return res.status(400).json({
                 message: 'Invalid or expired token'
            });
        }

        // Hash the new password before saving it
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);  // Hash the new password
        console.log("Hashed Password Before Saving:", hashedPassword);
        // Set the new hashed password
        user.password = hashedPassword;
        console.log('userPass',user.password);

        // Clear the reset token and expiration after password reset
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;

        // Save the user with the updated password
        await user.save();

        return res.status(200).json({
             message: 'Password has been successfully reset'
          });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
             message: 'Server error' 
        });
    }
}; */


const resetPassword = async (req, res) => {
    const { resetToken, password } = req.body;
    try {
        // Find the user with the reset token and check if it has expired
        const user = await User.findOne({
            resetToken,
            resetTokenExpiration: { $gt: Date.now() }, // Check if the reset token hasn't expired
        });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired token'
            });
        }

        // Hash the new password before saving it
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password.trim(), salt);  // Hash the new password
        console.log("Hashed Password Before Saving:", hashedPassword);

        // Set the new hashed password
        user.password = hashedPassword;  

        // Clear the reset token and expiration after password reset
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;

        // Save the user with the updated password
        await user.save();

        // Generate a new JWT token after password reset
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET, // Use your secret key
            { expiresIn: '1h' } // Set token expiration (1 hour)
        );

        return res.status(200).json({
            message: 'Password has been successfully reset',
            token, // Send the new JWT token
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Server error'
        });
    }
};


module.exports= {
    addUser,
    login,
    forgotPassword,
    resetPassword
    
}