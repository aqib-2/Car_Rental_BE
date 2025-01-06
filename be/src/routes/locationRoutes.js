const express = require('express');
const {verifyJwt} = require("../middleware/authMiddleware");
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { createLocation, getLocationById, getAllLocations, editLocation } = require('../controllers/locationController');

const router = express.Router();

router.post("/create", verifyJwt, authorizeRoles("admin"), createLocation);
router.get("/getAll", verifyJwt, authorizeRoles("admin","user"), getAllLocations);
router.get("/getById", verifyJwt, authorizeRoles("admin"), getLocationById);
router.put("/editById", verifyJwt, authorizeRoles("admin"), editLocation);

module.exports = router;