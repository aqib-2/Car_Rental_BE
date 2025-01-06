const express = require('express');
const {register, loginUser, logoutUser} = require("../controllers/authController");
const {verifyJwt} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login",loginUser);
router.post("/logout",verifyJwt,logoutUser);

module.exports = router;