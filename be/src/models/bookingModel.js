const mongoose = require('mongoose');

const booking = new mongoose.Schema({
        isActive:{
            type:Boolean,
        },
        carId: {
            type: String,
            required: true,
            ref: 'Car'
        },
        locationId: {
            type: String,
            required: true,
            ref: 'Location'
        },
        customerId: {
            type: String,
            required: true,
            ref: 'User'
        },
        fromDate: {
            type: Date,
            required: true
        },
        toDate: {
            type: Date,
            required: true
        },
        totalAmount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'pending',
            required: true
        },
        paymentId: {
            type: String,
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Booking', booking);