const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');

// Import Routes
const productRoute = require('./api/routes/product');
const userRoute = require('./api/routes/user');
const categoryRoute = require('./api/routes/category');

const app = express();

// Connect to MongoDB
mongoose.connect(
  'mongodb+srv://juli:juli123@cluster0.wj3qx.mongodb.net/your_database_name?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,  // Use new URL parser
    useUnifiedTopology: true,  // Use new Server Discover and Monitoring engine
    useCreateIndex: true,  // Ensure indexes are created properly
    useFindAndModify: false  // Use the new update/findOneAndUpdate method
  }
);

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('Connection failed:', err);
});

mongoose.connection.on('connected', () => {
  console.log('Connected successfully with the database');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload({ useTempFiles: true }));

// Routes Middleware
app.use('/product', productRoute);
app.use('/user', userRoute);
app.use('/category', categoryRoute);

// Handle Unknown Routes
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// Export the app
module.exports = app;
