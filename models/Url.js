const mongoose = require("mongoose");

// saving the data in DB
// defining a schema
const urlSchema = new mongoose.Schema({
  title:{
    type:String
  },
  longurl: {
    type: String,
  },
  shorturl: {
    type: String,
    unique: true,
  },
  shortid:{
    type:String
  },
  clicks: {
    type: Number,
    default:0
  },
  createdon: {
    type: String,
    default:String(new Date()).slice(4,15)    
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

// create a model
module.exports = mongoose.model("Url", urlSchema);