const express = require("express");
const dotenv = require("dotenv").config();
const dbConnect = require("./src/config/dbConnect.js");
const authRoutes = require("./src/routes/authRoutes.js");
const userRoutes = require("./src/routes/userRoutes.js");
dbConnect();

const app = express();

//middleware
app.use(express.json());

//Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)

//Server Start
const PORT = process.env.PORT || 8897;
app.listen(PORT,() => {
    console.log(`Server started running on ${PORT}`);
})