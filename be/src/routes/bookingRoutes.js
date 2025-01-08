const express = require('express');
const {verifyJwt} = require("../middleware/authMiddleware");
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { searchAvailableCars, createBooking, getBookingOfUser, getDashboardData } = require('../controllers/bookingController');

const router = express.Router();

router.get("/getAvailableCars",verifyJwt,authorizeRoles('user'),searchAvailableCars);
router.post("/create",verifyJwt,authorizeRoles('user'),createBooking);
router.get("/getuserbookings",verifyJwt,authorizeRoles('user'),getBookingOfUser);
router.get("/getdashboarddata",verifyJwt,authorizeRoles('admin'),getDashboardData);

module.exports = router;