const express = require('express');
const {verifyJwt} = require("../middleware/authMiddleware");
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { createOrderId, verifyPayment } = require('../controllers/paymentController');

const router = express.Router();

router.post("/create",verifyJwt,authorizeRoles('user'),createOrderId);
router.put("/verify",verifyJwt,authorizeRoles('user'),verifyPayment);

module.exports = router;