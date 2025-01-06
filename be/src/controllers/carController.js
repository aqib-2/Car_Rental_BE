const Car = require('../models/carModel');
const Location = require('../models/locationModel');
const { asyncHandler } = require("../utils/asynHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createCar = asyncHandler(async (req, res) => {
    const {carName,carBrand,isEnabled,isActive,modelYear,transmissionType,fuelType,carLocations,rentalPrice,imageUrlOne,imageUrlTwo} = req.body;
    if([carName, carBrand, modelYear,transmissionType,fuelType,imageUrlOne,imageUrlTwo].some((item) => item.trim() === "") || carLocations.length === 0){
        throw new ApiError(400, "All feilds are mandatory");
    }

    const car = await Car.create({
        isActive,
        isEnabled,
        carName,
        carBrand,
        modelYear,
        transmissionType,
        fuelType,
        imageUrlOne,
        imageUrlTwo,
        rentalPrice,
        carLocations
    })

    const createdCar = await Car.findById(car._id);
    
    if (!createdCar) {
        throw new ApiError(500, "Car creation failed");
    }

    return res
    .status(201)
    .json(new ApiResponse(201, createdCar, "Car created successfully"));
})

const getAllCars = asyncHandler(async (req, res) => {
    let cars = await Car.find({});

    if (!cars.length) {
        throw new ApiError(404, "No Vehicles found");
    }

    const locations = await Location.find({});

    cars = cars.map((car) => {
        car.carLocations.forEach((loc, index) => {
            const location = locations.find((location) => location._id.toString() === loc.toString());
            if (location) {
                car.carLocations[index] = location.name;
            }
        });
        return car;
    });


    return res
        .status(200)
        .json(new ApiResponse(200, cars, "Vehicles retrieved successfully"));
});

const getCarById = asyncHandler(async (req, res) => {
    const { id } = req.query;

    if (!id) {
        throw new ApiError(400, "Vehicle ID is required");
    }

    const car = await Car.findById(id);

    if (!car) {
        throw new ApiError(404, "Car not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, car, "Car retrieved successfully"));
});

const editCar = asyncHandler(async (req, res) => {
    const { id } = req.query;
    const {
        carName,
        carBrand,
        isEnabled,
        isActive,
        modelYear,
        transmissionType,
        fuelType,
        carLocations,
        rentalPrice,
        imageUrlOne,
        imageUrlTwo
    } = req.body;

    if ([carName, carBrand, modelYear, transmissionType, fuelType, imageUrlOne, imageUrlTwo].some((item) => item.trim() === "") || carLocations.length === 0) {
        throw new ApiError(400, "All fields are mandatory");
    }

    const updatedCar = await Car.findByIdAndUpdate(
        id,
        {
            carName,
            carBrand,
            isEnabled,
            isActive,
            modelYear,
            transmissionType,
            fuelType,
            carLocations,
            rentalPrice,
            imageUrlOne,
            imageUrlTwo
        },
        { new: true, runValidators: true }
    );

    if (!updatedCar) {
        throw new ApiError(404, "Car not found or update failed");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedCar, "Car updated successfully"));
});

module.exports={createCar,getAllCars,getCarById,editCar};