const Location = require('../models/locationModel');
const { asyncHandler } = require("../utils/asynHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createLocation = asyncHandler(async (req, res) => {
    const {name,description,isEnabled} = req.body;
    if(name.trim() === "" || description.trim() === ""){
        throw new ApiError(400, "All feilds are mandatory");
    }

    const location = await Location.create({
        isActive:true,
        isEnabled,
        name,
        description,
    })

    const createdLocation = await Location.findById(location._id);
    
    if (!createdLocation) {
        throw new ApiError(500, "Location creation failed");
    }

    return res
    .status(201)
    .json(new ApiResponse(201, createdLocation, "Location created successfully"));

});

const getAllLocations = asyncHandler(async (req, res) => {
    const locations = await Location.find({});

    if (!locations.length) {
        throw new ApiError(404, "No locations found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, locations, "Locations retrieved successfully"));
});

const getLocationById = asyncHandler(async (req, res) => {
    const { id } = req.query;

    if (!id) {
        throw new ApiError(400, "Location ID is required");
    }

    const location = await Location.findById(id);

    if (!location) {
        throw new ApiError(404, "Location not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, location, "Location retrieved successfully"));
});

const editLocation = asyncHandler(async (req, res) => {
    const { id } = req.query;
    const { name, description, isEnabled } = req.body;
    
    if (!id) {
        throw new ApiError(400, "Location ID is required");
    }
    if (name && name.trim() === "") {
        throw new ApiError(400, "Name cannot be empty");
    }
    if (description && description.trim() === "") {
        throw new ApiError(400, "Description cannot be empty");
    }

    const updatedLocation = await Location.findByIdAndUpdate(
        id,
        {
            $set: {
                ...(name && { name }),
                ...(description && { description }),
                ...(isEnabled !== undefined && { isEnabled }),
            },
        },
        { new: true, runValidators: true }
    );

    if (!updatedLocation) {
        throw new ApiError(404, "Location not found");
    }
    
    return res
        .status(200)
        .json(new ApiResponse(200, updatedLocation, "Location updated successfully"));
});


module.exports = {createLocation,getLocationById,getAllLocations,editLocation};