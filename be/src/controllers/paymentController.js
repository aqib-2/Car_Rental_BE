const { asyncHandler } = require("../utils/asynHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Razorpay = require('razorpay');
const Booking = require('../models/bookingModel');
const Payment = require('../models/paymentModel');
const crypto = require('crypto');


const createOrderId = asyncHandler(async (req, res) => {
    const {bookingId} = req.body;

    if(!bookingId){
        throw new ApiError(400,'BookingId is required')
    }

    const booking = await Booking.findOne({_id:bookingId});

    if(!booking){
        throw new ApiError(400,'Booking refrence not found')
    }

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY,
        key_secret: process.env.RAZORPAY_SECRET,
    })

    const options ={
        amount: booking.totalAmount * 100,
        currency: 'INR',
    }

    const response = await razorpay.orders.create(options);

    if(!response){
        throw new ApiError(400, "order creation failed");
    }

    const payment = await Payment.create({
        bookingId,
        orderId:response.id,
        currency: response.currency,
        amount:response.amount,
        transactionStatus:'pending',
        razorpayPaymentId:'',
        razorpayOrderId:'',
        razorpaySignature:''
    })

    if(!payment){
        throw new ApiError(500, "Payment Creation Failed");
    }

    const updateBooking = await Booking.findOneAndUpdate(
        { _id: bookingId },
        { $set: { paymentId: payment._id } },
        { new: true }
    );

    const orderDetails = {
        paymentId:payment._id,
        orderId:response.id,
        currency: response.currency,
        amount:response.amount,
    }

    return res.status(201).json( new ApiResponse(201,orderDetails,'order created successfully'))
});

const verifyPayment = asyncHandler(async (req,res) => {
    const { paymentId, orderCreationId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!orderCreationId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        const updateCondition = paymentId ? { _id: paymentId } : { orderId: orderCreationId };
        const payment = await Payment.findOneAndUpdate(
            updateCondition,
            {
                $set: {
                    razorpayPaymentId: razorpayPaymentId || "",
                    razorpayOrderId: razorpayOrderId || "",
                    razorpaySignature: razorpaySignature || "",
                    transactionStatus:'failed'
                },
            },
            { new: true }
        );

        const booking = await Booking.findOneAndUpdate(
            {_id : payment.bookingId},
            {
               $set:{
                status:"cancelled"
               } 
            },
            { new: true }
        )
        throw new ApiError(400, "Insufficient data to verify the payment");
    }

    const updateCondition = paymentId ? { _id: paymentId } : { orderId: orderCreationId };
    const payment = await Payment.findOneAndUpdate(
        updateCondition,
        {
            $set: {
                razorpayPaymentId,
                razorpayOrderId,
                razorpaySignature,
                transactionStatus:'successful'
            },
        },
        { new: true }
    );
    const booking = await Booking.findOneAndUpdate(
        {_id : payment.bookingId},
        {
           $set:{
            status:"confirmed"
           } 
        },
        { new: true }
    )

    const encryptedSignature = crypto.createHmac("sha256",process.env.RAZORPAY_SECRET);

    encryptedSignature.update(`${orderCreationId}|${razorpayPaymentId}`);

    const digest = encryptedSignature.digest("hex");

    if (digest !== razorpaySignature){
        throw new ApiError(400,"The transactin data is ot from authenticated source")
    }
    
    return res.status(200).json( new ApiResponse(200,[],'payment verified successfully'))
});




module.exports={ createOrderId,verifyPayment }