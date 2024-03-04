const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true
  },
  productCategory: {
    type: String,
    required: true,
  },
  subproductCategory: {
    type: String,
  },
  productBrand: {
    type: String,
    required: true
  },
  productColor: {
    type: String,
    required: true
  },
  productMrp: {
    type: Number,
    required: true
  },
  productPrice: {
    type: Number,
    required: true
  },
  productDescription: {
    type: String,
    required: true
  },
});

module.exports = mongoose.model('Product', productSchema);
