const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
   isActive:{
    type:Boolean,
   },
   isEnabled:{
    type:Boolean,
   },
   carName:{
    type:String,
    required : true,
   },
   carBrand:{
    type:String,
    required : true,
   },
   modelYear:{
    type:String,
    required : true,
   },
   transmissionType:{
    type:String,
    required : true,
    enum:["manual","automatic"]
   },
   fuelType:{
    type:String,
    required : true,
    enum:["petrol","diesel"]
   },
   carLocations:{
    type:[String],
   },
   rentalPrice:{
    type:Number,
    required:true,
   },
   imageUrlOne:{
    type:String,
    required : true,
   },
   imageUrlTwo:{
    type:String,
    required : true,
   },
},{
    timestamps: true
});

module.exports = mongoose.model("Car",carSchema);