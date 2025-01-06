const express = require('express');
const { asyncHandler } = require('../utils/asynHandler');
const ApiResponse = require('../utils/ApiResponse');
const {verifyJwt} = require("../middleware/authMiddleware");
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();


router.get("/admin", verifyJwt, authorizeRoles("admin") ,asyncHandler((req,res) => {
    return res.status(200).json(new ApiResponse(200,[],"admin route"))
}))

router.get("/user", verifyJwt, authorizeRoles("admin","user"), asyncHandler((req,res) => {
    return res.status(200).json(new ApiResponse(200,[],"user route"))
}))

module.exports = router;