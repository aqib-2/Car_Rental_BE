const { asyncHandler } = require("../utils/asynHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Car = require("../models/carModel");
const Booking = require("../models/bookingModel");
const Location = require("../models/locationModel");
const { adjustDates } = require("../utils/helperFunctions");

const searchAvailableCars = asyncHandler(async (req, res) => {
  const { locId, fromDate, toDate } = req.query;

  if (!locId || !fromDate || !toDate) {
    throw new ApiError(400, "Location ID, fromDate, and toDate are required.");
  }
  const dates = adjustDates(fromDate,toDate)
  const from = new Date(dates.from);
  const to = new Date(dates.to);

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    throw new ApiError(400, "Invalid date format.");
  }

  const cars = await Car.find({
    isActive: true,
    isEnabled: true,
    carLocations: locId,
  });

  if (cars.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, [], "No cars found for the selected location.")
      );
  }

  const availableCars = [];

  for (let car of cars) {
    const bookings = await Booking.find({
      carId: car._id,
      fromDate: { $lt: to },
      toDate: { $gt: from },
      status: { $in: ['pending', 'confirmed'] }
    }).exec();

    if (bookings.length === 0) {
      const differenceInTime = to.getTime() - from.getTime();
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 60 * 60 * 24));
  
      const carWithTotalPrice = car.toObject ? car.toObject() : { ...car };
      carWithTotalPrice.totalPrice = car.rentalPrice * differenceInDays;
      availableCars.push(carWithTotalPrice);
    }
  }

  return res
    .status(200)
    .json(
        new ApiResponse(200, availableCars, "Succesfully fetched the available cars")
    );
});

const createBooking = asyncHandler(async (req,res) => {
  const { locationId, carId, fromDate, toDate } = req.body;
  const { id } = req.user;

  if (!locationId || !carId || !fromDate || !toDate) {
    throw new ApiError(400,"locationId, carId, fromDate, and toDate are required.")
  }

  const dates = adjustDates(fromDate,toDate)
  const from = new Date(dates.from);
  const to = new Date(dates.to);

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    throw new ApiError(400, "Invalid date format.");
  }

  const conflictingBooking = await Booking.find({
      carId,
      fromDate: { $lt: to },
      toDate: { $gt: from },
      status: { $in: ['pending', 'confirmed'] }
    }).exec();

  if (conflictingBooking?.length > 0) {
    throw new ApiError(409,"The selected car is already booked for the given date range.")
  }

  const car = await Car.findOne({_id:carId});

  if (!car) {
    throw new ApiError(400,"Car not found.")
  }

  const differenceInDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24));

  const newBooking = await Booking.create({
    carId,
    locationId,
    customerId : id,
    fromDate: from,
    toDate: to,
    totalAmount: car.rentalPrice * differenceInDays,
    status: "pending",
    paymentId: ''
  })

  return res.status(201).json(
    new ApiResponse(201, newBooking, "Succesfully created the booking")
  );
});

const getBookingOfUser = asyncHandler(async (req,res) => {
  const { id } = req.user;

  const bookings = await Booking.find({ customerId: id }).populate('locationId','name').populate('carId',['carName','imageUrlOne']).select("-customerId");

  return res
    .status(200)
    .json(
        new ApiResponse(200, bookings, "Succesfully fetched the user bookings")
    );
});

const getDashboardData = asyncHandler(async (req,res) => {

  const cars = await Car.countDocuments();

  const locations = await Location.countDocuments();

  const bookings = await Booking.countDocuments({ status: { $in: ['confirmed'] } });

  const revenue = await Booking.aggregate([
    { 
      $match: { status: "confirmed" }
    },
    { 
      $group: { 
        _id:null,
        totalRevenue: { $sum: "$totalAmount" }
      } 
    }
  ])

  const totalRevenue = revenue[0]?.totalRevenue || 0;

  const data = {
    cars,
    locations,
    bookings,
    totalRevenue
  }

  return res.status(200).json(new ApiResponse(200,data,"Data retrived successfully"));
})

const getAllBookingData = asyncHandler(async (req,res) => {
  const { page, locationId, search } = req.query;

  const pageNumber = parseInt(page, 10);

  const query = {};

  if (locationId) {
    query.locationId = locationId;
  }

  if (search) {
    query.$expr = {
      $gte: [
        {
          $indexOfCP: [
            { $toString: "$_id" },
            { $toLower: search }
          ]
        },
        0
      ]
    };
  }

  const totalBookings = await Booking.countDocuments(query);
  const bookings = await Booking.find(query)
    .skip((pageNumber - 1) * 10)
    .sort({ createdAt: -1 })
    .populate('locationId','name')
    .populate('carId','carName')
    .populate('customerId', 'name');
  
  const data = {
    totalBookings,
    currentPage: pageNumber,
    totalPages: Math.ceil(totalBookings / 10),
    bookings
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200,data,"bokings retrived successfully")
    );
});

module.exports={searchAvailableCars,createBooking,getBookingOfUser,getDashboardData,getAllBookingData}