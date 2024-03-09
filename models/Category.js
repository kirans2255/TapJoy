const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
  CategoryImage: { 
    public_id:{
    type: String,
    required: true
    },
      url:{
        type:String,
        required:true,
      }
    },
  CategoryName: {
    type: String,
    required: true
  },

});

module.exports = mongoose.model('Category', userDataSchema);
