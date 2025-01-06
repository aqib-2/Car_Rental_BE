const express = require("express");
const dotenv = require("dotenv").config();
const swaggerUI = require('swagger-ui-express');
const cors = require('cors');
const dbConnect = require("./src/config/dbConnect.js");
const authRoutes = require("./src/routes/authRoutes.js");
const userRoutes = require("./src/routes/userRoutes.js");
const locationRoutes = require("./src/routes/locationRoutes.js");
const carRoutes = require("./src/routes/carRoutes.js");
const bookingRoutes = require("./src/routes/bookingRoutes.js");
const paymentRoutes = require("./src/routes/paymentRoutes.js");
const swaggerDoc = require('./src/config/swagger.json');
const { errorHandler } = require("./src/middleware/errorMiddleware.js");

//DB Conection
dbConnect();

const app = express();

//cors
app.use(cors());

//swagger-implementation
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));

//middleware
app.use(express.json());

//Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/location", locationRoutes)
app.use("/api/vehicle", carRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/payment", paymentRoutes);

app.use(errorHandler);

//Server Start
const PORT = process.env.PORT || 8897;
app.listen(PORT,() => {
    console.log(`Server started running on ${PORT}`);
})