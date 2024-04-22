const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  otp: { type: String },
  otpExpiration: { type: Date },
  Banner: [{
    BannerImage: {
      public_id: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true,
      }
    },
    Position: { type: String },
    Text: { type: String },
  }],
  Coupon: [{
    Coupon_Status: {type: String,
      enum: ['Active', 'InActive'],
      default: 'Active'
  },
    Coupon_Name : { type: String },
    Coupon_Value: { type: Number },
    Coupon_Type: {
      type: String,
      enum: ['percentage', 'fixedPrice'],
      default: 'percentage'
    },
    StartDate: {type: Date,required: true,default : Date.now},
    EndDate: {type: Date,required: true,default : Date.now},

  }]
});

module.exports = mongoose.model('Admin', userDataSchema);
