const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../utils/asynHandler");
const User = require("../models/userModel");
const ApiError = require("../utils/ApiError");



const verifyJwt = asyncHandler(async(req,res,next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer  ","") ?? "";
        if(!token){
            throw new ApiError(401,"unauthorized request");
        }
        
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        
        const user = await User.findById(decodedToken?.id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401,error?.message ?? "Invalid Access Token");
    }
});

module.exports = {verifyJwt}