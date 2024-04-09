const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
  productImage: { 
    type:Array,
    requires:true,
    },
  productName: {
    type: String,
    required: true
  },
  productCategory: {
    type: String,
    required: true,
  },
  variants: [
    {
      productPrice: {
        type: Number,
        required: true
      },
      productQuantity: {
        type: Number,
        required: true
      },
      productRam: {
        type: String,
        required: true
      },
      productRom: {
        type: String,
        required: true
      },
    }
  ], 
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
  productDescription: {
    type: String,
    required: true
  },
});

module.exports = mongoose.model('Product', productSchema);
