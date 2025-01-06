const { asyncHandler } = require("../utils/asynHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Car = require("../models/carModel");
const Booking = require("../models/bookingModel");
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
      $or: [
        { fromDate: { $lt: to }, toDate: { $gt: from } },
      ],
    });

    const differenceInTime = to.getTime() - from.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 60 * 60 * 24));

    const carWithTotalPrice = car.toObject ? car.toObject() : { ...car };
    carWithTotalPrice.totalPrice = car.rentalPrice * differenceInDays;

    if (bookings.length === 0) {
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

  const conflictingBooking = await Booking.findOne({
    carId,
    $or: [
      { fromDate: { $lt: to }, toDate: { $gt: from } }
    ]
  });

  if (conflictingBooking) {
    throw new ApiError(409,"The selected car is already booked for the given date range.")
  }

  const car = await Car.findOne({_id:carId});

  if (!car) {
    throw new ApiError(400,"Car not found.")
  }

  const newBooking = await Booking.create({
    carId,
    locationId,
    customerId : id,
    fromDate: from,
    toDate: to,
    totalAmount: car.rentalPrice * ((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)),
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

module.exports={searchAvailableCars,createBooking,getBookingOfUser}