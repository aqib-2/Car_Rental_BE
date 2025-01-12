const express = require('express');
const {verifyJwt} = require("../middleware/authMiddleware");
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { searchAvailableCars, createBooking, getBookingOfUser, getDashboardData, getAllBookingData } = require('../controllers/bookingController');

const router = express.Router();

router.get("/getAvailableCars",verifyJwt,authorizeRoles('user'),searchAvailableCars);
router.post("/create",verifyJwt,authorizeRoles('user'),createBooking);
router.get("/getuserbookings",verifyJwt,authorizeRoles('user'),getBookingOfUser);
router.get("/getdashboarddata",verifyJwt,authorizeRoles('admin'),getDashboardData);
router.get("/getBookingData",verifyJwt,authorizeRoles('admin'),getAllBookingData);

module.exports = router;