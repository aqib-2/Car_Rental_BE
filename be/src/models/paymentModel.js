const mongoose = require('mongoose');

const payment = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  bookingId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  transactionStatus: {
    type: String,
    enum: ['pending', 'successful', 'failed'],
    default: 'pending',
    required: true
  },
  currency:{
    type: String,
  },
  razorpayPaymentId:{
    type: String,
  },
  razorpayOrderId:{
    type: String,
  },
  razorpaySignature:{
    type: String,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', payment);
