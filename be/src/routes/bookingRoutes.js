const express = require('express');
const {verifyJwt} = require("../middleware/authMiddleware");
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { searchAvailableCars, createBooking, getBookingOfUser } = require('../controllers/bookingController');

const router = express.Router();

router.get("/getAvailableCars",verifyJwt,authorizeRoles('user'),searchAvailableCars);
router.post("/create",verifyJwt,authorizeRoles('user'),createBooking);
router.get("/getuserbookings",verifyJwt,authorizeRoles('user'),getBookingOfUser);

module.exports = router;