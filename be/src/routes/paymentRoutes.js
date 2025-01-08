const express = require('express');
const {verifyJwt} = require("../middleware/authMiddleware");
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { createOrderId, verifyPayment, cancelPayment } = require('../controllers/paymentController');

const router = express.Router();

router.post("/create",verifyJwt,authorizeRoles('user'),createOrderId);
router.put("/verify",verifyJwt,authorizeRoles('user'),verifyPayment);
router.put("/cancel",verifyJwt,authorizeRoles('user'),cancelPayment);

module.exports = router;