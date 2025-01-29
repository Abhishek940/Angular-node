const { string, required } = require('joi');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { 
        type: String, 
        required: true,
    
      },
      email: { 
        type: String,
        required: true 
    },
      mobile: { 
        type: Number, 
        required: true 
     },
     password:{
        type: String,
        required:true
     }
   
 
}, { timestamps: true });


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Skip if the password isn't modified
    try {
        const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
        this.password = await bcrypt.hash(this.password, salt); // Hash the password with the generated salt
        next();
    } catch (error) {
        next(error); // Pass any error that occurs during hashing to the next middleware
    }
});

// Define an instance method for comparing passwords
userSchema.methods.comparePassword = async function (inputPassword) {
    return await bcrypt.compare(inputPassword, this.password); // Compare passwords
};

module.exports = mongoose.model('User', userSchema, 'users');