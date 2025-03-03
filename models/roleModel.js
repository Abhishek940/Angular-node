const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
    name: { 
        type: String, 
        required: true,
        unique:true,
    },
      status: { 
      type: Number, 
      default:0
    },
 }, { timestamps: true });

module.exports = mongoose.model('role', roleSchema, 'roles');