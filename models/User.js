const mongoose = require('mongoose');


const wishlist = new mongoose.Schema({
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId },
    productRam: { type: String },
    productRom: { type: String },
  }]
})

const cart = new mongoose.Schema({
  products: [{
    // _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productId: { type: mongoose.Schema.Types.ObjectId },
    productRam: { type: String },
    productRom: { type: String },
    quantity: { type: Number, default: 1 },
  }]
})

const Address = new mongoose.Schema({
  name: { type: String },
  house_name: { type: String },
  street: { type: String },
  city: { type: String },
  state: { type: String },
  pin: { type: String },
  address_type: { type: String },
  phone: { type: String },
})

const orders = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productRam: { type: String, required: true },
        productRom: { type: String, required: true },
        quantity: { type: Number, required: true },
        totalprice: { type: Number, required: true },
        shippingAddress: { type: Address },
        cancelReason: { type: String }, // New field for cancellation reason
        payment_Method: {type:String},
        status: {type:String},
        created_at: {type:Date},
      },
    ]
  })  

const userDataSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  otp: { type: String },
  otpExpiration: { type: Date },
  wishlist: {
    type: wishlist,
    default: { products: [] }
  },
  cart: {
    type: cart,
    default: { products: [] }
  },
  addresses: [
    Address,
  ],
  order: [orders],
});




module.exports = mongoose.model('User', userDataSchema,);
