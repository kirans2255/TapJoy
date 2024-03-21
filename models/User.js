const mongoose = require('mongoose');


const wishlist = new mongoose.Schema({
  products: [{
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String },
    productPrice: { type: Number },
    productImage: { type: Array },
    // stockQuantity: {type: Number}
  }]
})

const userDataSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  otp: { type: String },
  otpExpiration: { type: Date },
  wishlist: {
    type: wishlist,
    default: { product: [] }
  },
});



module.exports = mongoose.model('User', userDataSchema,);
