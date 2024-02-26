const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  otp: { type: String },
  otpExpiration: { type: Date },
});

module.exports = mongoose.model('User', userDataSchema);
