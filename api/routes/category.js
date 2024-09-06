const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Category = require('../model/category');
const cloudinary = require('cloudinary').v2;
const checkAuth = require('../middleware/check-auth'); // Make sure this middleware is used if needed

// Configure Cloudinary
cloudinary.config({
  cloud_name:'dxezbrs4r',
  api_key:'487911261824684',
  api_secret:'8ERITqeEWM-cNRVkqbcJqEvwT64'
});


// Get all categories
router.post('/', (req, res, next) => {
  // Ensure files are uploaded
  if (!req.files || !req.files.photo) {
    return res.status(400).json({ error: 'No file uploaded or missing "photo" field.' });
  }

  const file = req.files.photo; // Access the uploaded file

  // Upload the image to Cloudinary
  cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
    if (err) {
      console.error('Error uploading to Cloudinary:', err);
      return res.status(500).json({ error: 'Error uploading image' });
    }

    // Create a new category instance with the uploaded image URL
    const category = new Category({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      photo: result.url,
    });

    // Save the new category to the database
    category
      .save()
      .then(savedCategory => {
        console.log('New category saved:', savedCategory);
        res.status(201).json({
          message: 'Category created successfully',
          new_category: savedCategory,
        });
      })
      .catch(err => {
        console.error('Error saving category:', err);
        res.status(500).json({
          error: 'Error saving category',
        });
      });
  });
});


// Save a new category
router.post('/', (req, res, next) => {
  // Ensure files are uploaded
  if (!req.files || !req.files.photo) {
    return res.status(400).json({ error: 'No file uploaded or missing "photo" field.' });
  }

  console.log(req.files); // Debugging statement to log uploaded files
  console.log(req.files); // Debugging statement to log uploaded files

  const file = req.files.photo; // Access the uploaded file

  // Upload the image to Cloudinary
  cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
    if (err) {
      console.error('Error uploading to Cloudinary:', err);
      return res.status(500).json({ error: 'Error uploading image' }); // More descriptive error message
    }

    // Create a new category instance with the uploaded image URL
    const category = new Category({
      _id: new mongoose.Types.ObjectId(), // Generate a new unique ID
      name: req.body.name,               // Get the category name from request body
      photo: result.url,                 // Store the Cloudinary URL
    });

    // Save the new category to the database
    category
      .save()
      .then(savedCategory => {
        console.log('New category saved:', savedCategory); // Log the saved category
        res.status(201).json({
          message: 'Category created successfully',
          new_category: savedCategory, // Return the saved category as the response
        });
      })
      .catch(err => {
        console.error('Error saving category:', err); // Log any error encountered during saving
        res.status(500).json({
          error: 'Error saving category', // More descriptive error message
        });
      });
  });
});


// Get a single category by ID
router.get('/:id', (req, res, next) => {
  const _id = req.params.id;
  Category.findById(_id)
    .select('_id name photo')
    .then(result => {
      res.status(200).json({
        category: result,
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// Update a category by ID
router.put('/:id', (req, res, next) => {
  console.log(req.params.id);
  const file = req.files.photo;
  console.log(file);
  cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    Category.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
          photo: result.url,
        },
      },
      { new: true } // Return the updated document
    )
      .then(result => {
        res.status(200).json({
          updated_category: result,
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  });
});

// Delete a category by ID
router.delete('/', (req, res, next) => {
  const imageUrl = req.query.imageUrl;
  const urlArray = imageUrl.split('/');
  const image = urlArray[urlArray.length - 1];
  const imageName = image.split('.')[0];
  const categoryId = req.query.id;

  Category.deleteOne({ _id: categoryId })  // Use `deleteOne` instead of `remove` (deprecated)
    .then(result => {
      cloudinary.uploader.destroy(imageName, (error, result) => {
        if (error) {
          console.log('Error deleting image from Cloudinary:', error);
        } else {
          console.log('Image deleted from Cloudinary:', result);
        }
      });
      res.status(200).json({
        message: 'Category deleted successfully',
        result: result,
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;

