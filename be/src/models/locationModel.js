const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
   isActive:{
    type:Boolean,
   },
   isEnabled:{
    type:Boolean,
   },
   name:{
    type:String,
    required : true,
   },
   description:{
    type:String,
    required : true,
   },
},{
    timestamps: true
});

module.exports = mongoose.model("Location",locationSchema);