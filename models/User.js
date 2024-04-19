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

const order = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    productId: {type:String, required:true},
    quantity: {type:String},
    price:{type:String},
    totalprice:{type:String},
    address: { type: Address },
    cancelReason: { type: String }, // New field for cancellation reason
    payment_Method: { type: String },
    razorpay_order_id:{type:String},
    razorpay_payment_id:{type:String},
    status: { type: String },
    created_at: { type: Date },
    
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
  orders: [order],
});




module.exports = mongoose.model('User', userDataSchema,);
