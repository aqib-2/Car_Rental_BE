const express = require('express');
const {verifyJwt} = require("../middleware/authMiddleware");
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { createCar, getAllCars, getCarById, editCar } = require('../controllers/carController');

const router = express.Router();

router.post("/create", verifyJwt, authorizeRoles("admin"), createCar);
router.get("/getAll", verifyJwt, authorizeRoles("admin"), getAllCars);
router.get("/getById", verifyJwt, authorizeRoles("admin"), getCarById);
router.put("/editById", verifyJwt, authorizeRoles("admin"), editCar);

module.exports = router;