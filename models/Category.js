const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
  CategoryImage: [{ 
    type: String,
    required: true
  }],
  CategoryName: {
    type: String,
    required: true
  },
});

module.exports = mongoose.model('Category', userDataSchema);
