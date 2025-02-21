const express = require('express');
const { config } = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const {DB_URL, PORT} = require('./config');

const routes = require('./routes/route');
const app = express();
const path = require('path');

// Connect to MongoDB
const mongoURI = DB_URL;  
console.log("port",PORT);
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected!');
  })
  .catch(err => {
    console.log('Error connecting to MongoDB:', err);
  });


// Middleware
app.use(cors());
app.use(express.json());
app.use('/api',routes);
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const PORTS = config.PORT || 3000; 
app.listen(PORTS, () => {
  console.log(`Server running on http://localhost:${PORTS}`);
});
