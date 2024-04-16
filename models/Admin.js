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
  }]
});

module.exports = mongoose.model('Admin', userDataSchema);
