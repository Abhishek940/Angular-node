const { string, required } = require('joi');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: { 
        type: String, 
        required: true,
    
      },
      price: { 
        type: Number, 
        required: true 
    },
      quantity: { 
        type: Number, 
        required: true 
    },
    image:{
      type:String,

    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema, 'products');