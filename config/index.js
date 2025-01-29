const dotenv = require('dotenv');
dotenv.config();
const {DB_URL, PORT} = process.env

module.exports= {
    DB_URL,
    PORT
}