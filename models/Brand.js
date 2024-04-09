const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
  BrandImage: { 
    public_id:{
    type: String,
    required: true
    },
      url:{
        type:String,
        required:true,
      }
    },
  BrandName: {
    type: String,
    required: true
  },
});


module.exports = mongoose.model('Brand', userDataSchema);
